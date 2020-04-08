using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Practice.Hubs;
using System;
using System.Collections.Generic;
using System.IO;
using System.Threading;
using System.Threading.Tasks;

namespace Practice
{
    public class RandomCashBoxSimulator : BackgroundService
    {
        private static ILogger<RandomCashBoxSimulator> _logger;
        private static IHubContext<OrdersHub, IOrdersHub> _ordersHub;

        private static DishesPool _dishesPool = DishesPool.GetInstance();
        private static Random _random = new Random();

        private static readonly int CONNECTION_CHECK_DELAY = 1000;

        private static readonly int CASHBOX_COUNT = 8;

        private static readonly int MIN_WAIT_DELAY = 7000;
        private static readonly int MAX_WAIT_DELAY = 15000;

        private static readonly decimal MIN_ORDER_REMOVAL_DELAY_COEFFICIENT = new decimal(0.6);
        private static readonly decimal MAX_ORDER_REMOVAL_DELAY_COEFFICIENT = new decimal(1.2);

        private static readonly decimal MIN_ESTIMATED_COOKING_TIME = new decimal(3);
        private static readonly decimal MAX_ESTIMATED_COOKING_TIME = new decimal(7);

        private static readonly int MIN_ORDERS_IN_INITIAL_DATA = 0;
        private static readonly int MAX_ORDERS_IN_INITIAL_DATA = 8;

        private static readonly int MIN_ITEMS_IN_ORDER = 1;
        private static readonly int MAX_ITEMS_IN_ORDER = 9;

        public RandomCashBoxSimulator(ILogger<RandomCashBoxSimulator> logger,
            IHubContext<OrdersHub, IOrdersHub> ordersHub)
        {
            _logger = logger;
            _logger.LogInformation("Beginning dish population....");

            var scraperDataKFCFileNames = Directory.GetFiles($"{Directory.GetCurrentDirectory()}\\ScrapersData\\KFC\\");

            foreach (string scrapedFileName in scraperDataKFCFileNames)
            {
                Dish[] deserializedDishes = DishDeserializer.DeserializeDishFile(scrapedFileName);

                foreach (var deserializedDish in deserializedDishes)
                {
                    //Generating random estimated cooking time
                    //Can't generated random decimal so using tricks
                    deserializedDish.EstimatedCookingTime =
                        _random.Next(
                            Decimal.ToInt32(MIN_ESTIMATED_COOKING_TIME) * 100,
                            Decimal.ToInt32(MAX_ESTIMATED_COOKING_TIME) * 100 + 1
                        ) / 100;
                }

                _dishesPool.AddDishes(deserializedDishes);
            }

            _logger.LogInformation("Populated Dishes...");

            _ordersHub = ordersHub;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            while (!stoppingToken.IsCancellationRequested)
            {
                //Wainting for the signal from client to start looping
                if (IsLoopRunningHolder.Instance.LoopRunning)
                {
                    _logger.LogInformation("Creating random order...");

                    //Generating order
                    Order generatedOrder = CreateRandomOrder();
                    await _ordersHub.Clients.All.AddOrder(generatedOrder);

                    ScheduleOrderRemoval(generatedOrder, _ordersHub).Start();

                    //Simulating delays
                    await Task.Delay(_random.Next(MIN_WAIT_DELAY, MAX_WAIT_DELAY));
                }
                else
                {
                    await Task.Delay(CONNECTION_CHECK_DELAY);
                }
            }
        }

        public static Order CreateRandomOrder()
        {
            var uuid = Guid.NewGuid();
            var randomDishes = GetRandomDishes();
            var randomCashBoxId = _random.Next(1, CASHBOX_COUNT + 1);

            return new Order(uuid.ToString(), randomDishes, randomCashBoxId);
        }


        public static Dish[] GetRandomDishes()
        {
            List<Dish> dishes = _dishesPool.GetDishes();
            int currentDishesCount = dishes.Count;

            if (currentDishesCount != 0)
            {
                int pickedDishLength =
                    Math.Min(_random.Next(MIN_ITEMS_IN_ORDER, MAX_ITEMS_IN_ORDER), currentDishesCount);
                Dish[] pickedDishes = new Dish[pickedDishLength];

                for (int i = 0; i < pickedDishLength; i++)
                {
                    pickedDishes[i] = dishes[_random.Next(0, currentDishesCount)];
                }

                return pickedDishes;
            }

            return new Dish[] { };
        }

        public static Task ScheduleOrderRemoval(Order order, IHubContext<OrdersHub, IOrdersHub> ordersHubContext)
        {
            Decimal currentMaxEstimatedCookingTime = order.Dishes[0].EstimatedCookingTime;
            for (int i = 1; i < order.Dishes.Length; i++)
            {
                if (order.Dishes[i].EstimatedCookingTime > currentMaxEstimatedCookingTime)
                {
                    currentMaxEstimatedCookingTime = order.Dishes[i].EstimatedCookingTime;
                }
            }

            return new Task(async () =>
            {
                int minEstimatedCookingTime = Decimal.ToInt32(currentMaxEstimatedCookingTime *
                                                              MIN_ORDER_REMOVAL_DELAY_COEFFICIENT) * 1000 * 60;
                int maxEstimatedCookingTime = (Decimal.ToInt32(currentMaxEstimatedCookingTime *
                                                               MAX_ORDER_REMOVAL_DELAY_COEFFICIENT) + 1) * 1000 * 60;
                
                await Task.Delay(_random.Next(minEstimatedCookingTime, Math.Max(minEstimatedCookingTime, maxEstimatedCookingTime))) ;

                await ordersHubContext.Clients.All.RemoveOrder(order.UUID);
            });
        }

        private static Order[] GenerateInitialData()
        {
            int initialItemsCount = _random.Next(MIN_ORDERS_IN_INITIAL_DATA, MAX_ORDERS_IN_INITIAL_DATA + 1);
            Order[] generatedOrders = new Order[initialItemsCount];

            for (int i = 0; i < initialItemsCount; i++)
            {
                generatedOrders[i] = CreateRandomOrder();
            }

            return generatedOrders;
        }

        public static void SendInitialData()
        {
            _logger.LogInformation("Starting to send initial data...");

            foreach (Order currentOrder in GenerateInitialData())
            {
                _ordersHub.Clients.All.AddOrder(currentOrder);
                ScheduleOrderRemoval(currentOrder, _ordersHub).Start();
            }

            _logger.LogInformation("Sent initial data!");
        }
    }
}