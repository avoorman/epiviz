drawMap <- function(viz=NULL, shape, color, data, center, scale, width = NULL, height = NULL, curveHeight = 0.3, tooltip = NULL) {


  settings = list(
    center = center,
    scale = scale,
    ylabel = ylabel,
    curveHeight = curveHeight,
    fade=fade,
    animationDuration = animationDuration,
    drawLegend = drawLegend
  )
  x <- list(
    minDate= dateRange[1],
    maxDate = dateRange[2],
    data = data,
    shape = shape,
    tooltip = tooltip,
    settings = settings
  )
  if(is.null(viz)){
    # create widget
    htmlwidgets::createWidget(
      name = 'epiviz',
      x,
      width = width,
      height = height,
      htmlwidgets::sizingPolicy(defaultWidth = 600, defaultHeight = 600),
      package = 'epiviz'
    )
  }
}
