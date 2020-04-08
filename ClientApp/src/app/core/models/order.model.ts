import Product from "./product.model";
import Decimal from 'decimal.js';
import UUID from "../util/uuid";
import RawOrder from "./raw-order.model";

export default class Order {
  public isAssigned: boolean = false;

  constructor(public readonly id: UUID,
              public readonly products: Product[],
              public readonly cashBoxId: number,) {
  }

  get estimatedCookingTime(): Decimal {
    return this.products.reduce((currentMax: Decimal, currentProduct: Product) => {
      return Decimal.max(currentMax, currentProduct.estimatedCookingTime);
    }, new Decimal(0))
  }

  public static parseOrder(rawOrder: RawOrder): Order {
    const uuid = rawOrder.uuid;
    const cashBoxId = rawOrder.cashBox;

    const parsedProducts: Product[] = rawOrder.dishes.map((currentDish) => {
      return new Product(
        currentDish.name,
        currentDish.description,
        currentDish.category,
        currentDish.imageLink,
        new Decimal(currentDish.estimatedCookingTime
        ));
    });

    return new Order(uuid, parsedProducts, cashBoxId);
  }
}
