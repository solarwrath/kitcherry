using System.Text;

namespace Practice
{
    public class Order
    {
        public string UUID { get; set; }
        public Dish[] Dishes { get; set; }
        public int CashBox { get; set; }

        public Order(string uuid, Dish[] dishes, int cashBox)
        {
            this.UUID = uuid;
            this.Dishes = dishes;
            this.CashBox = cashBox;
        }

        public override string ToString()
        {
            StringBuilder dishesStringBuilder = new StringBuilder();
            foreach (var dish in Dishes)
            {
                dishesStringBuilder.AppendJoin(',', dish.ToString());
            }

            return $"UUID: {UUID};\nDishes: ${dishesStringBuilder};\ncashBox: ${CashBox}";
        }
    }
}