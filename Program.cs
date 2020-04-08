using System.Linq;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Hosting;
using Practice;

namespace PLS_WORK
{
    public class Program
    {
        public static void Main(string[] args)
        {
            if (args.Any(currentArg => currentArg.Equals("updateScrapedData")))
            {
                KFCScraper kfcScraper = new KFCScraper();
                kfcScraper.MyScrape("\\ScrapersData\\KFC\\");
            }

            CreateHostBuilder(args).Build().Run();
        }

        public static IHostBuilder CreateHostBuilder(string[] args) =>
            Host.CreateDefaultBuilder(args)
                .ConfigureWebHostDefaults(webBuilder => { webBuilder.UseStartup<Startup>(); });
    }
}