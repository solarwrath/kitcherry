namespace Practice
{
    public class Dish
    {
        public string Name { get; set; }
        public string Category { get; set; }
        public string Description { get; set; }
        public float Price { get; set; }
        public string ImageLink { get; set; }
        public decimal EstimatedCookingTime { get; set; }

        public override string ToString()
        {
            return "Name:" + Name + '\n'
                   + "Category:" + Category + '\n'
                   + "Description:" + Description + '\n'
                   + "Price:" + Price + '\n'
                   + "ImageLink:" + ImageLink + '\n'
                   + "EstimatedCookingTime:" + EstimatedCookingTime;
        }
    }
}