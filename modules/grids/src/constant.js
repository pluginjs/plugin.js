export const namespace = 'grids'

export const events = {
  READY: 'ready',
  ENABLE: 'enable',
  DISABLE: 'disable',
  DESTROY: 'destroy',
  CHANGED: 'changed',
  RESIZE: 'resize',
  FILTER: 'filter',
  SORT: 'sort',
  REVERSE: 'reverse',
  CHUNKCLICK: 'chunkClick'
}

export const classes = {
  NAMESPACE: `pj-${namespace}`,
  THEME: '{namespace}--{theme}',
  MASK: '{namespace}-mask',
  INNER: '{namespace}-inner',
  INNERSHOW: '{namespace}-inner-show',
  IMAGELOADED: '{namespace}-image-loaded',
  IMAGEERROR: '{namespace}-image-error',
  LOADED: '{namespace}-loaded',
  TOOLBAR: '{namespace}-toolbar',
  FILTERS: '{namespace}-filters',
  FILTER: '{namespace}-filter',
  SORT: '{namespace}-sort',
  SORTINNER: '{namespace}-sort-inner',
  REVERSE: '{namespace}-reverse',
  REVERSEMIN: '{namespace}-reverse-min',
  CHUNK: '{namespace}-chunk',
  CHUNKINNER: '{namespace}-chunk-inner',
  CHUNKACTIVE: '{namespace}-chunk-active',
  SHOW: '{namespace}-show',
  HIDE: '{namespace}-hide',
  GRIDMODEL: '{namespace}-grid',
  MASONRYMODEL: '{namespace}-masonry',
  JUSTIFIEDMODEL: '{namespace}-justified',
  NESTEDMODEL: '{namespace}-nested'
}

export const methods = [
  'value',
  'enable',
  'disable',
  'destroy',
  'filter',
  'sort',
  'reverse',
  'getChunks',
  'getModel',
  'getWidth'
]

export const defaults = {
  theme: null,
  itemSelector: null, // [selector / null] null => select children of the element.
  imgSelector: 'img', // [selector / null] If there is any image in item, the grid will select an IMG element marked by Imgselector
  model: 'grid', // select model
  maxColumn: 5, // [number] set the max column number.
  gutter: 0,
  minHeight: 100, // item min height. unit: px.
  minWidth: 200, // item min width. unit: px.
  aspectRatio: null, // 'Width:Height' global items aspect ratio. item own aspect ratio can be replaced by it. item own aspect ratio > global aspect ratio > item own size
  delay: 60, // chunk animating delay for each of list. unit: ms.
  duration: 800, // The animation duration. unit: ms.
  direction: 'topLeft', // the chunks arrangement origin. ["topLeft", "topRight","bottomLeft","bottomRight"]
  filtertheme: 'group',
  filters: [],
  toolbar: {
    filters: false,
    sort: false,
    reverse: false
  },
  sortby: '',
  sortDirection: 'max', // min && max
  animate: 'fadeInUp', // fadeInUp,fadeInDown, fadeInLeft, fadeInRight, zoomIn, zoomOut, bounce, bounceIn, flip, calendar, cards, fan
  effects: {}, // set custom effects.
  loader: {
    theme: 'snake',
    color: '#000000',
    size: 'lg'
  }, // false, options
  templates: {
    chunk() {
      return '<div class="{class} {classes.CHUNK}"><div class="{classes.CHUNKINNER}">{html}</div></div>'
    },
    toolbar() {
      return `<div class="{classes.TOOLBAR}">
                {filters}
                {sort}
                {reverse}
              </div>`
    },
    filters() {
      return '<div class="{classes.FILTERS}"></div>'
    },
    sort() {
      return '<div class="{classes.SORT}"><button class="{classes.SORTINNER} pj-btn"></button></div>'
    },
    reverse() {
      return '<div class="{classes.REVERSE}"><button class="pj-btn pj-btn-icon"><i class="pj-icon pj-icon-angle-down"></i></button></div>'
    }
  },
  sort(key, chunks) {
    if (!key) {
      return chunks
    }
    chunks = [].concat(chunks)

    chunks.sort((prev, next) => {
      if (!prev.sort || !next.sort) {
        return 0
      }

      let prevVal = prev.sort[key]
      let nextVal = next.sort[key]

      if (key === 'date') {
        prevVal = new Date(prevVal)
        nextVal = new Date(nextVal)
      }

      if (prevVal < nextVal) {
        return -1
      }

      if (prevVal > nextVal) {
        return 1
      }

      return 0
    })

    if (this.options.sortDirection === 'max') {
      chunks.reverse()
    }

    return chunks
  },
  parseTagsStr(str) {
    if (!str) {
      return false
    }

    if (typeof str !== 'string') {
      return [str]
    }

    return str.split(',')
  }
}

export const dependencies = ['anime', 'filters', 'image-loader', 'loader']

/* chunks options */
/*
  {
    id: 'A',
    sizeX:1,
    sizeY:1,
    tags: ['a', 'b', 'c'], // Array && string
    template(){
      return `<article class='{class}'></article>`  // chunk templates
    },
    sort: {
      createDate: '1970-01-01'
    }
  }

*/
