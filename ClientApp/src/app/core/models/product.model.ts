import Decimal from "decimal.js";

export default class Product {
  constructor(
    public readonly name: string,
    public readonly description: string,
    public readonly category: string,
    public readonly imagePath: string,
    public readonly estimatedCookingTime: Decimal,
  ) {
  }
}
