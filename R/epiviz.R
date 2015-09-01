#'  EpiViz
#'
#' Geo-spatial animation of epidemics
#'
#' TO DO::
#' #' Condense to single SVG
#' lazy_eval for arguments
#' Allow different binning, and removal of epicurve
#' Add linkage feature
#' Choropleth + animation
#' Standardize mapping (district, province, country, etc.)
#' Documentation....
#'
#' @import htmlwidgets
#'
#' @export
epiviz <- function(data, shape, dateRange = NULL, ylabel = "Cases/month",scale = 1, width = NULL, height = NULL, curveHeight = 0.3, fade = 180, animationDuration = 60, center = NULL, tooltip = NULL, drawLegend = TRUE) {

  if(is.null(data$tooltip)) data$tooltip = paste0("Date: " , data$onset)
  if(is.null(data$color)) data$color = "red"
  if(is.null(data$type)) drawLegend = FALSE
  if(is.null(center)){
    center =c(mean(range(data$x)),mean(range(data$y)))
  }
  if(is.null(dateRange)){
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
    shape = shape,
    tooltip = tooltip,
  	settings = settings
  )

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
