#'  epiviz
#'
#' Geo-spatial animation of epidemics
#'
#'
#' @import htmlwidgets
#'
#' @export
epiviz <- function(baseMap=NULL, data,dateRange = NULL, center = NULL, scale = 1, ylabel = "Cases/month", width = NULL, height = NULL, curveHeight = 0.3, fade = 180, animationDuration = 60, tooltip = NULL, drawLegend = TRUE) {
  if(is.null(baseMap)){
    baseMap <- jsMap()
  }

  if(is.null(data$tooltip) & !is.null(data)) data$tooltip = paste0("Date: " , data$onset)
  if(is.null(data$color) & !is.null(data) ) data$color = "red"
  if(is.null(data$type)) drawLegend = FALSE
  if(is.null(center) & !is.null(data)){
    center =c(mean(range(data$x)),mean(range(data$y)))
  }
  if(is.null(dateRange) & !is.null(data)){
    dateRange = range(data$onset)
  }
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
    tooltip = tooltip,
  	settings = settings
  )

  x <- mergeLists(baseMap$x,x)

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

#' Widget output function for use in Shiny
#'
#' @export
epivizOutput <- function(outputId, width = '100%', height = '400px'){
  shinyWidgetOutput(outputId, 'epiviz', width, height, package = 'epiviz')
}

#' Widget render function for use in Shiny
#'
#' @export
renderEpiviz <- function(expr, env = parent.frame(), quoted = FALSE) {
  if (!quoted) { expr <- substitute(expr) } # force quoted
  shinyRenderWidget(expr, epivizOutput, env, quoted = TRUE)
}
