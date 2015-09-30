#'  Utility functions
#'
#'  Functions for styling html maps
#'
#' @export
mapStyle <- function(feature, stroke="black", width=1, fill="none",opacity = 1,...){
  re <- list(paste0(".",feature, " {",
           paste(c("stroke","stroke-width","fill","fill-opacity"), c(stroke,width,fill,opacity), sep=":",collapse="; "),
           ...,
           "}")
  )
  names(re) <- feature
  re
}

mergeLists <- function (base_list, overlay_list, recursive = TRUE)
{
  if (length(base_list) == 0)
    overlay_list
  else if (length(overlay_list) == 0)
    base_list
  else {
    merged_list <- base_list
    for (name in names(overlay_list)) {
      base <- base_list[[name]]
      overlay <- overlay_list[[name]]
      if (is.list(base) && is.list(overlay) && recursive)
        merged_list[[name]] <- mergeLists(base, overlay)
      else if(length(overlay_list[[name]]) > 0){
        merged_list[[name]] <- NULL
        merged_list <- append(merged_list, overlay_list[which(names(overlay_list) %in%
                                                                name)])
      }
    }
    merged_list
  }
}
