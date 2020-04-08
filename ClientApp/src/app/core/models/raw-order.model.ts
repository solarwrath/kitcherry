import UUID from "../util/uuid";
import Decimal from "decimal.js";

export default interface RawOrder {
  uuid: UUID,
  dishes: {
    name: string,
    description: string,
    category: string,
    imageLink: string,
    price: number,
    estimatedCookingTime: Decimal | number,
  }[],
  cashBox: number,
}
