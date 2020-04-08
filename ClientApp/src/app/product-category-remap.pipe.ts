import {Pipe, PipeTransform} from '@angular/core';
import Product from "./core/models/product.model";
import {capitalize} from "@ngrx/store/schematics-core/utility/strings";

export interface CategoryData {
  categoryTitle: string,
  products: Product[]
}

@Pipe({
  name: 'productCategoryRemap'
})
export class ProductCategoryRemapPipe implements PipeTransform {
  transform(products: Product[], ...args: unknown[]): CategoryData[] {
    const remappedData: CategoryData[] = [];

    products.forEach((currentProduct: Product) => {
      const currentProductCategoryTitle = capitalize(currentProduct.category);

      let categoryEntry = remappedData.find((currentHaystackCategory) => {
        return currentProductCategoryTitle === currentHaystackCategory.categoryTitle;
      });

      if (categoryEntry === undefined) {
        remappedData.push({
          categoryTitle: capitalize(currentProductCategoryTitle),
          products: [currentProduct],
        });
      } else {
        categoryEntry.products.push(currentProduct);
      }
    });

    return remappedData;
  }
}
