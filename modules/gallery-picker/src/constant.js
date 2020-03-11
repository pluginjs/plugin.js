import { isString } from '@pluginjs/is'

export const namespace = 'galleryPicker'

export const events = {
  READY: 'ready',
  ENABLE: 'enable',
  DISABLE: 'disable',
  DESTROY: 'destroy',
  CHANGE: 'change'
}

export const classes = {
  NAMESPACE: `pj-${namespace}`,
  THEME: '{namespace}--{theme}',
  DISABLED: '{namespace}-disabled',
  ACTIVE: '{namespace}-active',
  WRITE: '{namespace}-write',
  EXIST: '{namespace}-exist',
  SHOW: '{namespace}-show',
  HOVER: '{namespace}-hover',
  FILL: '{namespace}-fill',
  EDIT: '{namespace}-edit',
  REMOVE: '{namespace}-remove',
  FILLIMAGE: '{namespace}-fill-image',
  FILLCOUNT: '{namespace}-fill-count',
  FILLADD: '{namespace}-fill-add',
  TRIGGERACTION: '{namespace}-trigger-action',
  CANCEL: '{namespace}-cancel',
  SAVE: '{namespace}-save',
  ADDBTN: '{namespace}-add-btn',
  ADD: '{namespace}-add',
  ITEMS: '{namespace}-items',
  CONTROL: '{namespace}-control',
  ITEM: '{namespace}-item',
  ITEMHOVER: '{namespace}-item-hover',
  ITEMIMAGE: '{namespace}-item-image',
  ITEMREMOVE: '{namespace}-item-remove',
  ITEMRESELECT: '{namespace}-item-reselect',
  EMPTY: '{namespace}-empty',
  DROPDOWN: '{namespace}-dropdown',
  TRIGGER: '{namespace}-trigger',
  OPENDISABLE: '{namespace}-open-disabled'
}

export const methods = [
  'val',
  'get',
  'set',
  'clear',
  'remove',
  'change',
  'add',
  'enable',
  'disable',
  'destroy'
]

export const defaults = {
  theme: null,
  locale: 'en',
  localeFallbacks: true,
  responsiveDropdownFull: false,
  disabled: false,
  dropdown: {
    placement: 'bottom-start' // top
  },

  templates: {
    main() {
      return (
        '<div class="{classes.NAMESPACE}">' +
        '<div class="{classes.EMPTY}">' +
        '<i class="pj-icon pj-icon-images"></i>{placeholder}' +
        '</div>' +
        '<div class="{classes.FILL}">' +
        '<div class="{classes.FILLIMAGE}" style=""></div>' +
        '<span class="{classes.FILLCOUNT}">{count}</span>' +
        '</div>' +
        '<div class="{classes.TRIGGERACTION}"><i class="{classes.EDIT} pj-icon pj-icon-edit"></i><i class="{classes.REMOVE} pj-icon pj-icon-trash"></i></div>' +
        '<div class="{classes.DROPDOWN}">' +
        '<ul class="{classes.ITEMS}">' +
        '<li class="{classes.ADD}">' +
        '<i class="pj-icon pj-icon-picture"></i>{add}' +
        '</li>' +
        '</ul>' +
        '<div class="{classes.CONTROL}">' +
        '<button class="{classes.CANCEL} pj-btn pj-btn-transparent">{footerCancel}</button>' +
        // '<button class="{namespace}-expand-add-btn pj-btn pj-btn-outline-default">{footerAdd}</button>' +
        '<button class="{classes.SAVE} pj-btn pj-btn-primary">{footerSave}</button>' +
        '</div>' +
        '</div>' +
        '</div>'
      )
    },
    image() {
      return `<li class='{classes.ITEM}'>
        <div class="{classes.ITEMIMAGE}" style="background-image:url({imgSrc})" />
        <div class='{changeClass}'>
          <i class='{reselectClass} pj-icon pj-icon-repeat'></i>
          <i class='{removeClass} pj-icon pj-icon-trash'></i>
        </div>
      </li>`
    }
  },

  process(value) {
    if (value && typeof value !== 'undefined') {
      return value.join(',')
    }
    return ''
  },

  parse(value) {
    if (isString(value) && value.length !== 0) {
      let array = []
      array = value.split(',')
      return array
    }
    return []
  },

  getImage(value) {
    return value
  },
  change() {
    return false // return an image url;
  },

  add() {
    return false // return an array of image url list;
  }
}

export const dependencies = ['pop-dialog']

export const translations = {
  en: {
    placeholder: 'Add images',
    count: 'zero',
    expand: 'expand',
    change: 'change',
    deleteTitle: 'Are you sure you want to delete?',
    cancel: 'Cancel',
    delete: 'Delete',
    add: 'Add',
    save: 'Save'
  },
  zh: {
    placeholder: '点击添加',
    count: '零',
    expand: '展开',
    change: '更换图片',
    deleteTitle: '你确定要删除？',
    cancel: '取消',
    delete: '删除',
    add: '添加',
    save: '保存'
  }
}
