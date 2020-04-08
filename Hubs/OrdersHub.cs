using System.Threading.Tasks;
using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.Logging;

namespace Practice.Hubs
{
    public class OrdersHub : Hub<IOrdersHub>
    {
        private ILogger<OrdersHub> _logger;

        public OrdersHub(ILogger<OrdersHub> logger)
        {
            _logger = logger;
        }

        public async Task AddOrder(Order order)
        {
            await Clients.All.AddOrder(order);
            _logger.LogInformation($"Added order with id ${order.UUID}");
        }

        public async Task RemoveOrder(string orderId)
        {
            await Clients.All.RemoveOrder(orderId);
            _logger.LogInformation($"Removed order with id: {orderId}!");
        }

        public void StartRandomSimulation()
        {
            IsLoopRunningHolder.Instance.LoopRunning = true;
            _logger.LogInformation("Started the random simulation loop...");
            RandomCashBoxSimulator.SendInitialData();
        }
    }
}