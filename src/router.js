import Vue from 'vue'
import Router from 'vue-router'
import Home from './views/Home'
import NewAddress from './views/user/NewAddress'
import BackupsAddress from './views/user/BackupsAddress'
import PocmUser from './views/user/PocmUser'
import User from './views/user/User'
import ProjectsList from './views/projects/ProjectsList'
import ProjectsInfo from './views/projects/ProjectsInfo'
import ProjectsLaunch from './views/projects/ProjectsLaunch'
import NewToken from './views/token/NewToken'
import NewPocm from './views/token/NewPocm'

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
      path: '/PocmUser',
      name: 'pocmUser',
      component: PocmUser
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
      path: '/Token/NewPocm',
      name: 'newPocm',
      component: NewPocm
    }
  ]
})
