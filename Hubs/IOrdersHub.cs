using System.Threading.Tasks;

namespace Practice.Hubs
{
    public interface IOrdersHub
    {
        Task AddOrder(Order order);
        Task RemoveOrder(string uuid);
    }
}