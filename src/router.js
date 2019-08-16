import Vue from 'vue'
import Router from 'vue-router'
import Home from './views/Home'
import NewAddress from './views/user/NewAddress'
import ImportAddress from './views/user/ImportAddress'
import BackupsAddress from './views/user/BackupsAddress'
import User from './views/user/User'
import ProjectsList from './views/projects/ProjectsList'
import ProjectsInfo from './views/projects/ProjectsInfo'
import ProjectsLaunch from './views/projects/ProjectsLaunch'
import NewToken from './views/token/NewToken'
import CodeToken from './views/token/CodeToken'

Vue.use(Router);

export default new Router({
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home
    },
    {
      path: '/User/NewAddress',
      name: 'newAddress',
      component: NewAddress
    },
    {
      path: '/User/ImportAddress',
      name: 'importAddress',
      component: ImportAddress
    },
    {
      path: '/User/BackupsAddress',
      name: 'backupsAddress',
      component: BackupsAddress
    },
    {
      path: '/User',
      name: 'user',
      component: User
    },
    {
      path: '/Projects/ProjectsList',
      name: 'projectsList',
      component: ProjectsList
    },
    {
      path: '/Projects/ProjectsInfo',
      name: 'projectsInfo',
      component: ProjectsInfo
    },
    {
      path: '/Projects/ProjectsLaunch',
      name: 'projectsLaunch',
      component: ProjectsLaunch
    },
    {
      path: '/Token/NewToken',
      name: 'newToken',
      component: NewToken
    },
    {
      path: '/Token/CodeToken',
      name: 'codeToken',
      component: CodeToken
    }
  ]
})
