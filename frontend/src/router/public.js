import PublicView from '../layouts/PublicView.vue';


const public_routes = [
    {
      path: '/',
      component: PublicView, // Layout principal
      children: [
        {
          path: '', // rota '/' será Home
          name: 'Home',
          component: () =>
            import(
              /* webpackChunkName: "home" */ '../views/HomeView.vue'
            )
        },
      ]
    }
]

export default public_routes