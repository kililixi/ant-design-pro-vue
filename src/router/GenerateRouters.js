import Vue from 'vue'
import Router from 'vue-router'
import Layout from '@/layout'
import {
  componentMap
} from './index'

Vue.use(Router)

export function generateRoutes (menus) {
  // 最终生成的路由
  const asyncRouterMap = []

  menus.forEach(topMenu => {
    // 只有顶级菜单拥有子菜单
    if (topMenu.children) {
      // 开始循环顶级菜单下的一级菜单
      topMenu.children.forEach(fMenu => {
        // 如果有子菜单且子菜单个数不为0的
        const firstMenu = {
          path: fMenu.menuUrl == null ? '/nopath' : fMenu.menuUrl,
          component: Layout,
          name: fMenu.menuCode,
          hidden: fMenu.isShow !== '0',
          meta: {
            title: fMenu.menuName,
            icon: fMenu.menuIcon,
            topMenuCode: topMenu.menuCode // 所属的顶级菜单
          }
        }
        if (fMenu.children !== null && fMenu.children.length > 0) {
          firstMenu.children = generateSubRoutes(fMenu.children, topMenu.menuCode)
        }
        asyncRouterMap.push(firstMenu)
      })
    }
  })

  return asyncRouterMap
}

export function formatMenus (menus) {
  // 获取顶层元素
  const accessedRouters = menus.filter(v => {
    const parentCode = v.parentId
    if (parentCode == null || parentCode === '' || parentCode === '0') {
      return true
    }
  })

  // 获取每个顶层元素的子数据集合
  accessedRouters.forEach(v => {
    v.children = getSubList(v.id, menus)
  })

  generateRoutes(accessedRouters)
  return accessedRouters
}

function getSubList (id, menus) {
  // 子集的直接子对象
  const childList = menus.filter(v => {
    return v.parentId === id
  })

  // 子集的间接子对象
  childList.forEach(v => {
    v.children = getSubList(v.id, menus)
  })

  // 递归退出条件
  if (childList.length === 0) {
    return null
  }

  return childList
}

// 递归生成路由
function generateSubRoutes (children, topMenuCode) {
  if (children === null) return
  const routes = []
  children.forEach(v => {
    routes.push({
      path: v.menuUrl == null ? '/nopath' : v.menuUrl,
      // component: _import('errorPage/noComponent'),
      // component: () => require('../views/errorPage/noComponent.vue'),
      hidden: v.isShow !== '0',
      component: getComponentByKey(v.menuComponent),
      // component: () => getComponentByKey,
      // component: () => import('@/views/' + v.menuComponent).then(module => {
      //   return module.default
      // }).catch(err => console.log('chunk loaded failed')),
      // component: (resolve) => {
      //   try {
      //     return require(['@/views' + v.menuComponent], resolve)
      //   } catch (e) {
      //     alert('1111')
      //   }
      // },
      // component: () => {
      //   _import('errorPage/noComponent')
      //   // console.log('Vcompo', v.menuComponent)
      //   // alert('dfd')
      //   // import('@/views/errorPage/noComponent')
      // },
      name: v.menuComponent || v.menuCode,
      meta: {
        topMenuCode: topMenuCode, // 所属的顶级菜单
        title: v.menuName,
        icon: v.menuIcon
      },
      children: generateSubRoutes(v.children)
    })
  })

  return routes
}

function getComponentByKey (key) {
  return componentMap[key] == null ? componentMap['noComponent'] : componentMap[key]
}
