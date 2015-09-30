#'  jsMap
#'
#' Create an html map
#'
#'
#' @export
jsMap <- function(topojson=NULL, fill=NULL, palette =NULL, mapOptions = NULL, map_id=NULL,center = NULL, scale = 500, width = NULL, height = NULL) {

  if(is.null(topojson)){
    message("No topojson supplied. Using Natural Earth admin 1 map.")
    data(naturalEarth)
    topojson <- naturalEarth01
  }
  if(is.null(mapOptions)){
    objs <- names(topojson$objects)
    for(i in 1:length(objs)) mapOptions <- c(mapOptions,mapStyle(objs[i], width = 1/i))
  }
  if(is.null(center)){
    center =c(mean(c(topojson$objects[[1]]$bbox[[1]],topojson$objects[[1]]$bbox[[3]])) ,
              mean(c(topojson$objects[[1]]$bbox[[2]],topojson$objects[[1]]$bbox[[4]])))
  }
  if(is.numeric(fill)){
    if(is.null(palette)) palette = "Blues"
    fillScale = "linear"
    fillDomain = c(min(fill),mean(min(fill),max(fill)),max(fill))
    fillRange = col_numeric(fillDomain, palette = palette)(fillDomain)
    fill = col_numeric(fillDomain, palette = palette)(fill)
  } else if(is.factor(fill) | is.character(fill)){
    if(is.null(palette)) palette = "Set3"
    fillScale = "discrete"
    fillDomain = unique(fill)
    fillRange = col_factor(fillDomain, palette = palette)(fillDomain)
    fill = col_factor(fillDomain, palette = palette)(fill)
  } else {
    fillScale <- fillDomain <- fillRange <- fill <- NULL
  }
  settings = list(
    center = center,
    scale = scale,
    fillScale = fillScale,
    curveHeight = 0,
    mapOptions= mapOptions
  )

  x <- list(
    shape = topojson,
    mapFills = fill,
    fillDomain = fillDomain,
    fillRange = fillRange,
    fillScale = fillScale,
    mapIds = map_id,
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
