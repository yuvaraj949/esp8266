"use client"

import * as React from "react"
import * as RechartsPrimitive from "recharts"

import { cn } from "@/lib/utils"
import type { TooltipProps } from "recharts";
import type { LegendProps, LegendPayload } from "recharts";
import ReactECharts from "echarts-for-react";

// Format: { THEME_NAME: CSS_SELECTOR }
const THEMES = { light: "", dark: ".dark" } as const

export type ChartConfig = {
  [k in string]: {
    label?: React.ReactNode
    icon?: React.ComponentType
  } & (
    | { color?: string; theme?: never }
    | { color?: never; theme: Record<keyof typeof THEMES, string> }
  )
}

type ChartContextProps = {
  config: ChartConfig
}

const ChartContext = React.createContext<ChartContextProps | null>(null)

function useChart() {
  const context = React.useContext(ChartContext)

  if (!context) {
    throw new Error("useChart must be used within a <ChartContainer />")
  }

  return context
}

// Add types for xDomain and xTicks
export interface ChartContainerProps extends React.ComponentProps<"div"> {
  config: ChartConfig
  children?: React.ComponentProps<typeof RechartsPrimitive.ResponsiveContainer>["children"]
  xDomain?: [string, string] // ISO strings for start and end
  xTicks?: string[] // Array of ISO strings for each time slot
  echartOption?: any // ECharts option object
  echartTheme?: string // 'dark' | 'light' | undefined
  echartStyle?: React.CSSProperties
  themeMode?: string // 'dark' | 'light'
}

const ChartContainer = React.forwardRef<
  HTMLDivElement,
  ChartContainerProps
>(({ id, className, children, config, xDomain, xTicks, echartOption, echartTheme, echartStyle, themeMode, ...props }, ref) => {
  const uniqueId = React.useId()
  const chartId = `chart-${id || uniqueId.replace(/:/g, "")}`
  const isDark = themeMode === 'dark';
  const bgClass = isDark ? 'bg-gray-800' : 'bg-white';
  const bgColor = isDark ? '#1f2937' : '#fff';

  // If echartOption is provided, render ECharts
  if (echartOption) {
    // Patch the ECharts option to use the correct background
    const patchedOption = { ...echartOption, backgroundColor: bgColor };
    return (
      <div
        data-chart={chartId}
        ref={ref}
        className={cn(
          bgClass,
          "flex aspect-video justify-center text-xs border-none shadow-none rounded-lg",
          className
        )}
        style={{ ...props.style }}
        {...props}
      >
        <ChartStyle id={chartId} config={config} />
        <ReactECharts
          option={patchedOption}
          theme={echartTheme}
          style={echartStyle || { height: 320, width: "100%", background: bgColor }}
          notMerge={true}
          lazyUpdate={true}
        />
      </div>
    )
  }

  // Provide xDomain and xTicks via context for use in XAxis
  return (
    <ChartContext.Provider value={{ config }}>
      <div
        data-chart={chartId}
        ref={ref}
        className={cn(
          "flex aspect-video justify-center text-xs [&_.recharts-cartesian-axis-tick_text]:fill-muted-foreground [&_.recharts-cartesian-grid_line[stroke='#ccc']]:stroke-border/50 [&_.recharts-curve.recharts-tooltip-cursor]:stroke-border [&_.recharts-dot[stroke='#fff']]:stroke-transparent [&_.recharts-layer]:outline-none [&_.recharts-polar-grid_[stroke='#ccc']]:stroke-border [&_.recharts-radial-bar-background-sector]:fill-muted [&_.recharts-rectangle.recharts-tooltip-cursor]:fill-muted [&_.recharts-reference-line_[stroke='#ccc']]:stroke-border [&_.recharts-sector[stroke='#fff']]:stroke-transparent [&_.recharts-sector]:outline-none [&_.recharts-surface]:outline-none",
          className
        )}
        {...props}
      >
        <ChartStyle id={chartId} config={config} />
        <RechartsPrimitive.ResponsiveContainer>
          {/* Clone children and inject xDomain/xTicks if present */}
          {(() => {
            const mapped = React.Children.map(children, (child) => {
              if (
                React.isValidElement(child) &&
                (xDomain || xTicks)
              ) {
                return React.cloneElement(child as any, {
                  xDomain,
                  xTicks,
                })
              }
              return child
            })
            // ResponsiveContainer expects a single child
            if (!mapped || mapped.length === 0) return <g />
            if (Array.isArray(mapped) && mapped.length === 1) return mapped[0]
            if (!Array.isArray(mapped)) return mapped
            // If multiple, wrap in a fragment
            return <>{mapped}</>
          })()}
        </RechartsPrimitive.ResponsiveContainer>
      </div>
    </ChartContext.Provider>
  )
})
ChartContainer.displayName = "Chart"

const ChartStyle = ({ id, config }: { id: string; config: ChartConfig }) => {
  const colorConfig = Object.entries(config).filter(
    ([_, config]) => config.theme || config.color
  )

  if (!colorConfig.length) {
    return null
  }

  return (
    <style
      dangerouslySetInnerHTML={{
        __html: Object.entries(THEMES)
          .map(
            ([theme, prefix]) => `
${prefix} [data-chart=${id}] {
${colorConfig
  .map(([key, itemConfig]) => {
    const color =
      itemConfig.theme?.[theme as keyof typeof itemConfig.theme] ||
      itemConfig.color
    return color ? `  --color-${key}: ${color};` : null
  })
  .join("\n")}
}
`
          )
          .join("\n"),
      }}
    />
  )
}

const ChartTooltip = RechartsPrimitive.Tooltip

const ChartTooltipContent = React.forwardRef<
  HTMLDivElement,
  Omit<TooltipProps<any, any>, "ref"> & React.ComponentProps<"div"> & {
    hideLabel?: boolean
    hideIndicator?: boolean
    indicator?: "line" | "dot" | "dashed"
    nameKey?: string
    labelKey?: string
  }
>(
  (props, ref) => {
    const { config } = useChart()

    // Explicitly extract payload and label from props, using type assertions to avoid type errors
    const active = (props as any).active
    const payload = (props as any).payload
    const label = (props as any).label
    const className = (props as any).className
    const indicator = (props as any).indicator ?? "dot"
    const hideLabel = (props as any).hideLabel ?? false
    const hideIndicator = (props as any).hideIndicator ?? false
    const labelFormatter = (props as any).labelFormatter
    const labelClassName = (props as any).labelClassName
    const formatter = (props as any).formatter
    const color = (props as any).color
    const nameKey = (props as any).nameKey
    const labelKey = (props as any).labelKey
    const rest = props

    const safePayload = (payload ?? []) as Array<any>

    const tooltipLabel = React.useMemo(() => {
      if (hideLabel || !safePayload.length) {
        return null
      }

      const [item] = safePayload
      const key = `${labelKey || item.dataKey || item.name || "value"}`
      const itemConfig = getPayloadConfigFromPayload(config, item, key)
      const value =
        !labelKey && typeof label === "string"
          ? config[label as keyof typeof config]?.label || label
          : itemConfig?.label

      if (labelFormatter) {
        return (
          <div className={cn("font-medium", labelClassName)}>
            {labelFormatter(value, safePayload)}
          </div>
        )
      }

      if (!value) {
        return null
      }

      return <div className={cn("font-medium", labelClassName)}>{value}</div>
    }, [
      label,
      labelFormatter,
      safePayload,
      hideLabel,
      labelClassName,
      config,
      labelKey,
    ])

    if (!active || !safePayload.length) {
      return null
    }

    const nestLabel = safePayload.length === 1 && indicator !== "dot"

    return (
      <div
        ref={ref}
        className={cn(
          "grid min-w-[8rem] items-start gap-1.5 rounded-lg border border-border/50 bg-background px-2.5 py-1.5 text-xs shadow-xl",
          className
        )}
        {...rest}
      >
        {!nestLabel ? tooltipLabel : null}
        <div className="grid gap-1.5">
          {safePayload.map((item: any, index: number) => {
            const key = `${nameKey || item.name || item.dataKey || "value"}`
            const itemConfig = getPayloadConfigFromPayload(config, item, key)
            const indicatorColor = color || item.payload?.fill || item.color

            return (
              <div
                key={item.dataKey}
                className={cn(
                  "flex w-full flex-wrap items-stretch gap-2 [&>svg]:h-2.5 [&>svg]:w-2.5 [&>svg]:text-muted-foreground",
                  indicator === "dot" && "items-center"
                )}
              >
                {formatter && item?.value !== undefined && item.name ? (
                  formatter(item.value, item.name, item, index, item.payload)
                ) : (
                  <>
                    {itemConfig?.icon ? (
                      <itemConfig.icon />
                    ) : (
                      !hideIndicator && (
                        <div
                          className={cn(
                            "shrink-0 rounded-[2px] border-[--color-border] bg-[--color-bg]",
                            {
                              "h-2.5 w-2.5": indicator === "dot",
                              "w-1": indicator === "line",
                              "w-0 border-[1.5px] border-dashed bg-transparent":
                                indicator === "dashed",
                              "my-0.5": nestLabel && indicator === "dashed",
                            }
                          )}
                          style={
                            {
                              "--color-bg": indicatorColor,
                              "--color-border": indicatorColor,
                            } as React.CSSProperties
                          }
                        />
                      )
                    )}
                    <div
                      className={cn(
                        "flex flex-1 justify-between leading-none",
                        nestLabel ? "items-end" : "items-center"
                      )}
                    >
                      <div className="grid gap-1.5">
                        {nestLabel ? tooltipLabel : null}
                        <span className="text-muted-foreground">
                          {itemConfig?.label || item.name}
                        </span>
                      </div>
                      {item.value && (
                        <span className="font-mono font-medium tabular-nums text-foreground">
                          {item.value.toLocaleString()}
                        </span>
                      )}
                    </div>
                  </>
                )}
              </div>
            )
          })}
        </div>
      </div>
    )
  }
)
ChartTooltipContent.displayName = "ChartTooltip"

const ChartLegend = RechartsPrimitive.Legend

const ChartLegendContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & {
    payload?: LegendPayload[]
    verticalAlign?: LegendProps["verticalAlign"]
    hideIcon?: boolean
    nameKey?: string
  }
>(
  (
    { className, hideIcon = false, payload = [], verticalAlign = "bottom", nameKey, ...rest },
    ref
  ) => {
    const { config } = useChart()

    if (!payload.length) {
      return null
    }

    return (
      <div
        ref={ref}
        className={cn(
          "flex items-center justify-center gap-4",
          verticalAlign === "top" ? "pb-3" : "pt-3",
          className
        )}
        {...rest}
      >
        {payload.map((item: LegendPayload) => {
          const key = `${nameKey || item.dataKey || "value"}`
          const itemConfig = getPayloadConfigFromPayload(config, item, key)

          return (
            <div
              key={item.value}
              className={cn(
                "flex items-center gap-1.5 [&>svg]:h-3 [&>svg]:w-3 [&>svg]:text-muted-foreground"
              )}
            >
              {itemConfig?.icon && !hideIcon ? (
                <itemConfig.icon />
              ) : (
                <div
                  className="h-2 w-2 shrink-0 rounded-[2px]"
                  style={{
                    backgroundColor: item.color,
                  }}
                />
              )}
              {itemConfig?.label}
            </div>
          )
        })}
      </div>
    )
  }
)
ChartLegendContent.displayName = "ChartLegend"

// Helper to extract item config from a payload.
function getPayloadConfigFromPayload(
  config: ChartConfig,
  payload: unknown,
  key: string
) {
  if (typeof payload !== "object" || payload === null) {
    return undefined
  }

  const payloadPayload =
    "payload" in payload &&
    typeof payload.payload === "object" &&
    payload.payload !== null
      ? payload.payload
      : undefined

  let configLabelKey: string = key

  if (
    key in payload &&
    typeof payload[key as keyof typeof payload] === "string"
  ) {
    configLabelKey = payload[key as keyof typeof payload] as string
  } else if (
    payloadPayload &&
    key in payloadPayload &&
    typeof payloadPayload[key as keyof typeof payloadPayload] === "string"
  ) {
    configLabelKey = payloadPayload[
      key as keyof typeof payloadPayload
    ] as string
  }

  return configLabelKey in config
    ? config[configLabelKey]
    : config[key as keyof typeof config]
}

export {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  ChartStyle,
}
