using System.IO;
using Newtonsoft.Json;

namespace Practice
{
    public class DishDeserializer
    {
        public static void DeleteFilesFromFolder(string folderPath)
        {
            string[] folderFiles = Directory.GetFiles(Directory.GetCurrentDirectory() + folderPath);
            foreach (string file in folderFiles)
            {
                File.Delete(file);
            }
        }

        public static Dish[] DeserializeDishFile(string filePath)
        {
            return JsonConvert.DeserializeObject<Dish[]>(File.ReadAllText(filePath));
        }
    }
}