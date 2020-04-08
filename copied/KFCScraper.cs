using System.Collections.Generic;
using System.IO;
using IronWebScraper;

namespace Practice
{
    public class KFCScraper : WebScraper
    {
        public static Dictionary<string, DishesEntry> menu = new Dictionary<string, DishesEntry>();
        string menuFilesPath = Directory.GetCurrentDirectory();

        public override void Init()
        {
            LoggingLevel = LogLevel.All;
            Request("https://www.kfc-ukraine.com", Parse);
        }

        public override void Parse(Response response)
        {
            var menuNavBar = response.Css("ul.main-nav li.menu ul.sub-nav")[0];
            foreach (var specialMenu in menuNavBar.ChildNodes)
            {
                if (specialMenu.InnerHtml != null)
                {
                    string specialMenuName = specialMenu.TextContentClean;

                    menu.Add(specialMenuName, new DishesEntry());

                    string specialMenuLink;
                    specialMenuLink = specialMenu.ChildNodes[1].Attributes["href"];

                    Request(specialMenuLink, ParseSpecialMenu,
                        new MetaData() {{"specialMenuName", specialMenuName}});
                }
            }
        }

        public void ParseSpecialMenu(Response response)
        {
            var productsUL = response.Css("ul.products-detail-list")[0];

            string specialMenuName = response.MetaData.Get<string>("specialMenuName");
            string filePath = Directory.GetCurrentDirectory()
                              + "/ScrapersData/KFC/" + specialMenuName
                              + ".json";
            foreach (var productLI in productsUL.ChildNodes)
            {
                if (productLI.InnerHtml != null)
                {
                    menu[specialMenuName].counter++;

                    string productPageLink = productLI.ChildNodes[1].Attributes["href"];

                    Request(productPageLink, ParseProduct, new MetaData()
                    {
                        {"specialMenuName", specialMenuName},
                        {"filePath", filePath}
                    });
                }
            }
        }

        public void ParseProduct(Response response)
        {
            Dish product = new Dish();

            var productInfoElement = response.Css("div.product-info-wrp")[0];

            product.ImageLink = response.Css("div.product-photo-wrp")[0].ChildNodes[1].Attributes["src"];
            product.Name = productInfoElement.ChildNodes[1].InnerTextClean;
            product.Description = productInfoElement.ChildNodes[3].InnerTextClean;
            product.Category = response.MetaData.Get<string>("specialMenuName");
            product.Price = float.Parse(productInfoElement.ChildNodes[7].ChildNodes[0].TextContentClean);

            menu[response.MetaData.Get<string>("specialMenuName")].products.Add(product);
        }

        public void MyScrape(string scrapeDataFolder, string newScrapeDataFolder = null,
            bool clearOldDataFolder = false)
        {
            if (newScrapeDataFolder == null)
            {
                DishDeserializer.DeleteFilesFromFolder(scrapeDataFolder);
                menuFilesPath += scrapeDataFolder;
            }
            else
            {
                if (clearOldDataFolder)
                {
                    DishDeserializer.DeleteFilesFromFolder(scrapeDataFolder);
                }

                menuFilesPath += newScrapeDataFolder;
            }

            var scraper = new KFCScraper();
            var scraperTask = scraper.StartAsync();

            while (true)
            {
                if (scraperTask.IsCompleted)
                    break;
            }

            foreach (var menuName in menu.Keys)
            {
                Scrape(menu[menuName].products, this.menuFilesPath + menuName + ".json");
            }
        }
    }
}