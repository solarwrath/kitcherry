using System.Collections.Generic;

namespace Practice
{
    public class DishesPool
    {
        private static DishesPool instance;
        private List<Dish> dishes = new List<Dish>();

        private DishesPool()
        {
        }

        public static DishesPool GetInstance()
        {
            if (instance == null)
            {
                instance = new DishesPool();
            }

            return instance;
        }

        public void AddDishes(List<Dish> dishes)
        {
            this.dishes.AddRange(dishes);
        }

        public void AddDishes(Dish[] dishes)
        {
            this.dishes.AddRange(dishes);
        }

        public List<Dish> GetDishes()
        {
            return dishes;
        }
    }
}