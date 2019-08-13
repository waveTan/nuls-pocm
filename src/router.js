import Vue from 'vue'
import Router from 'vue-router'
import Home from './views/Home'
import NewAddress from './views/user/NewAddress'
import ImportAddress from './views/user/ImportAddress'
import BackupsAddress from './views/user/BackupsAddress'
import ProjectsList from './views/projects/ProjectsList'
import NewToken from './views/token/NewToken'

Vue.use(Router);

export default new Router({
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home
    },
    {
      path: '/NewAddress',
      name: 'newAddress',
      component: NewAddress
    },
    {
      path: '/ImportAddress',
      name: 'importAddress',
      component: ImportAddress
    },
    {
      path: '/BackupsAddress',
      name: 'backupsAddress',
      component: BackupsAddress
    },
    {
      path: '/Projects/ProjectsList',
      name: 'projectsList',
      component: ProjectsList
    },
    {
      path: '/Token/NewToken',
      name: 'newToken',
      component: NewToken
    }

  ]
})
