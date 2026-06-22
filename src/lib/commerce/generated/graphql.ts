/* eslint-disable */
/** Internal type. DO NOT USE DIRECTLY. */
type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
/** Internal type. DO NOT USE DIRECTLY. */
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
import type { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
/** Collection statistic attributes operators */
export type AttributeOperatorEnum =
  | 'AND'
  | 'IN'
  | 'NOT_IN';

/** Product backorder enumeration */
export type BackordersEnum =
  | 'NO'
  | 'NOTIFY'
  | 'YES';

/** Product catalog visibility enumeration */
export type CatalogVisibilityEnum =
  | 'CATALOG'
  | 'HIDDEN'
  | 'SEARCH'
  | 'VISIBLE';

/** Countries enumeration */
export type CountriesEnum =
  | 'AD'
  | 'AE'
  | 'AF'
  | 'AG'
  | 'AI'
  | 'AL'
  | 'AM'
  | 'AO'
  | 'AQ'
  | 'AR'
  | 'AS'
  | 'AT'
  | 'AU'
  | 'AW'
  | 'AX'
  | 'AZ'
  | 'BA'
  | 'BB'
  | 'BD'
  | 'BE'
  | 'BF'
  | 'BG'
  | 'BH'
  | 'BI'
  | 'BJ'
  | 'BL'
  | 'BM'
  | 'BN'
  | 'BO'
  | 'BQ'
  | 'BR'
  | 'BS'
  | 'BT'
  | 'BV'
  | 'BW'
  | 'BY'
  | 'BZ'
  | 'CA'
  | 'CC'
  | 'CD'
  | 'CF'
  | 'CG'
  | 'CH'
  | 'CI'
  | 'CK'
  | 'CL'
  | 'CM'
  | 'CN'
  | 'CO'
  | 'CR'
  | 'CU'
  | 'CV'
  | 'CW'
  | 'CX'
  | 'CY'
  | 'CZ'
  | 'DE'
  | 'DJ'
  | 'DK'
  | 'DM'
  | 'DO'
  | 'DZ'
  | 'EC'
  | 'EE'
  | 'EG'
  | 'EH'
  | 'ER'
  | 'ES'
  | 'ET'
  | 'FI'
  | 'FJ'
  | 'FK'
  | 'FM'
  | 'FO'
  | 'FR'
  | 'GA'
  | 'GB'
  | 'GD'
  | 'GE'
  | 'GF'
  | 'GG'
  | 'GH'
  | 'GI'
  | 'GL'
  | 'GM'
  | 'GN'
  | 'GP'
  | 'GQ'
  | 'GR'
  | 'GS'
  | 'GT'
  | 'GU'
  | 'GW'
  | 'GY'
  | 'HK'
  | 'HM'
  | 'HN'
  | 'HR'
  | 'HT'
  | 'HU'
  | 'ID'
  | 'IE'
  | 'IL'
  | 'IM'
  | 'IN'
  | 'IO'
  | 'IQ'
  | 'IR'
  | 'IS'
  | 'IT'
  | 'JE'
  | 'JM'
  | 'JO'
  | 'JP'
  | 'KE'
  | 'KG'
  | 'KH'
  | 'KI'
  | 'KM'
  | 'KN'
  | 'KP'
  | 'KR'
  | 'KW'
  | 'KY'
  | 'KZ'
  | 'LA'
  | 'LB'
  | 'LC'
  | 'LI'
  | 'LK'
  | 'LR'
  | 'LS'
  | 'LT'
  | 'LU'
  | 'LV'
  | 'LY'
  | 'MA'
  | 'MC'
  | 'MD'
  | 'ME'
  | 'MF'
  | 'MG'
  | 'MH'
  | 'MK'
  | 'ML'
  | 'MM'
  | 'MN'
  | 'MO'
  | 'MP'
  | 'MQ'
  | 'MR'
  | 'MS'
  | 'MT'
  | 'MU'
  | 'MV'
  | 'MW'
  | 'MX'
  | 'MY'
  | 'MZ'
  | 'NA'
  | 'NC'
  | 'NE'
  | 'NF'
  | 'NG'
  | 'NI'
  | 'NL'
  | 'NO'
  | 'NP'
  | 'NR'
  | 'NU'
  | 'NZ'
  | 'OM'
  | 'PA'
  | 'PE'
  | 'PF'
  | 'PG'
  | 'PH'
  | 'PK'
  | 'PL'
  | 'PM'
  | 'PN'
  | 'PR'
  | 'PS'
  | 'PT'
  | 'PW'
  | 'PY'
  | 'QA'
  | 'RE'
  | 'RO'
  | 'RS'
  | 'RU'
  | 'RW'
  | 'SA'
  | 'SB'
  | 'SC'
  | 'SD'
  | 'SE'
  | 'SG'
  | 'SH'
  | 'SI'
  | 'SJ'
  | 'SK'
  | 'SL'
  | 'SM'
  | 'SN'
  | 'SO'
  | 'SR'
  | 'SS'
  | 'ST'
  | 'SV'
  | 'SX'
  | 'SY'
  | 'SZ'
  | 'TC'
  | 'TD'
  | 'TF'
  | 'TG'
  | 'TH'
  | 'TJ'
  | 'TK'
  | 'TL'
  | 'TM'
  | 'TN'
  | 'TO'
  | 'TR'
  | 'TT'
  | 'TV'
  | 'TW'
  | 'TZ'
  | 'UA'
  | 'UG'
  | 'UM'
  | 'US'
  | 'UY'
  | 'UZ'
  | 'VA'
  | 'VC'
  | 'VE'
  | 'VG'
  | 'VI'
  | 'VN'
  | 'VU'
  | 'WF'
  | 'WS'
  | 'XK'
  | 'YE'
  | 'YT'
  | 'ZA'
  | 'ZM'
  | 'ZW';

/** Customer address information */
export type CustomerAddressInput = {
  /** Address 1 */
  address1?: string | null | undefined;
  /** Address 2 */
  address2?: string | null | undefined;
  /** City */
  city?: string | null | undefined;
  /** Company */
  company?: string | null | undefined;
  /** Country */
  country?: CountriesEnum | null | undefined;
  /** E-mail */
  email?: string | null | undefined;
  /** First name */
  firstName?: string | null | undefined;
  /** Last name */
  lastName?: string | null | undefined;
  /** Clear old address data */
  overwrite?: boolean | null | undefined;
  /** Phone */
  phone?: string | null | undefined;
  /** Zip Postal Code */
  postcode?: string | null | undefined;
  /** State */
  state?: string | null | undefined;
};

/** Sort direction for ordered results. Determines whether items are returned in ascending or descending order. */
export type OrderEnum =
  /** Results ordered from lowest to highest values (i.e. A-Z, oldest-newest) */
  | 'ASC'
  /** Results ordered from highest to lowest values (i.e. Z-A, newest-oldest) */
  | 'DESC';

/** Order status enumeration */
export type OrderStatusEnum =
  /** Cancelled */
  | 'CANCELLED'
  /** Draft */
  | 'CHECKOUT_DRAFT'
  /** Completed */
  | 'COMPLETED'
  /** Failed */
  | 'FAILED'
  /** On hold */
  | 'ON_HOLD'
  /** Pending payment */
  | 'PENDING'
  /** Processing */
  | 'PROCESSING'
  /** Refunded */
  | 'REFUNDED';

/** Product attribute taxonomies */
export type ProductAttributeEnum =
  | 'PA_COLOUR'
  | 'PA_CUSHIONING'
  | 'PA_DROP'
  | 'PA_GENDER'
  | 'PA_PRONATION'
  | 'PA_WEIGHT'
  | 'PA_WIDTH';

/** Product filter */
export type ProductAttributeFilterInput = {
  /** A list of term ids */
  ids?: Array<number | null | undefined> | null | undefined;
  /** Filter operation type */
  operator?: AttributeOperatorEnum | null | undefined;
  /** Which field to select taxonomy term by. */
  taxonomy: ProductAttributeEnum;
  /** A list of term slugs */
  terms?: Array<string | null | undefined> | null | undefined;
};

/** Product filter */
export type ProductAttributeQueryInput = {
  /** Limit result set to products with selected global attributes. */
  queries?: Array<ProductAttributeFilterInput | null | undefined> | null | undefined;
  /** The logical relationship between attributes when filtering across multiple at once. */
  relation?: AttributeOperatorEnum | null | undefined;
};

/** Product type enumeration */
export type ProductTypesEnum =
  /** An external product */
  | 'EXTERNAL'
  /** A product group */
  | 'GROUPED'
  /** A simple product */
  | 'SIMPLE'
  /** A variable product */
  | 'VARIABLE'
  /** A product variation */
  | 'VARIATION';

/** Fields to order the Products connection by */
export type ProductsOrderByEnum =
  /** Order by publish date */
  | 'DATE'
  /** Preserve the ID order given in the IN array */
  | 'IN'
  /** Order by the menu order value */
  | 'MENU_ORDER'
  /** Order by last modified date */
  | 'MODIFIED'
  /** Order by name */
  | 'NAME'
  /** Preserve slug order given in the NAME_IN array */
  | 'NAME_IN'
  /** Order by date product sale starts */
  | 'ON_SALE_FROM'
  /** Order by date product sale ends */
  | 'ON_SALE_TO'
  /** Order by parent ID */
  | 'PARENT'
  /** Order by product popularity */
  | 'POPULARITY'
  /** Order by product's current price */
  | 'PRICE'
  /** Order by product average rating */
  | 'RATING'
  /** Order by product's regular price */
  | 'REGULAR_PRICE'
  /** Order by number of reviews on product */
  | 'REVIEW_COUNT'
  /** Order by product's sale price */
  | 'SALE_PRICE'
  /** Order by slug */
  | 'SLUG'
  /** Order by total sales of products sold */
  | 'TOTAL_SALES';

/** Options for ordering the connection */
export type ProductsOrderbyInput = {
  field: ProductsOrderByEnum;
  order?: OrderEnum | null | undefined;
};

/** Product stock status enumeration */
export type StockStatusEnum =
  | 'IN_STOCK'
  | 'ON_BACKORDER'
  | 'OUT_OF_STOCK';

/** Sorting attributes for taxonomy term collections. Determines which property of taxonomy terms is used for ordering results. */
export type TermObjectsConnectionOrderbyEnum =
  /** Ordering by number of associated content items. */
  | 'COUNT'
  /** Alphabetical ordering by term description text. */
  | 'DESCRIPTION'
  /** Alphabetical ordering by term name. */
  | 'NAME'
  /** Alphabetical ordering by URL-friendly name. */
  | 'SLUG'
  /** Ordering by assigned term grouping value. */
  | 'TERM_GROUP'
  /** Ordering by internal identifier. */
  | 'TERM_ID'
  /** Ordering by manually defined sort position. */
  | 'TERM_ORDER';

export type CartCrossSellsQueryVariables = Exact<{
  slugIn?: Array<string | null | undefined> | string | null | undefined;
}>;


export type CartCrossSellsQuery = { products: { nodes: Array<
      | { slug: string | null }
      | { slug: string | null }
      | { slug: string | null, crossSell: { nodes: Array<
            | { slug: string | null }
            | { slug: string | null }
            | { slug: string | null }
            | { slug: string | null }
            | Record<PropertyKey, never>
          > } | null }
      | { slug: string | null, crossSell: { nodes: Array<
            | { slug: string | null }
            | { slug: string | null }
            | { slug: string | null }
            | { slug: string | null }
            | Record<PropertyKey, never>
          > } | null }
    > } | null };

export type OrderAddressFragment = { firstName: string | null, lastName: string | null, company: string | null, address1: string | null, address2: string | null, city: string | null, state: string | null, postcode: string | null, country: CountriesEnum | null, email: string | null, phone: string | null };

export type OrderCardFragment = { databaseId: number | null, orderNumber: string | null, status: OrderStatusEnum | null, date: string | null, total: string | null, needsPayment: boolean | null };

export type LineItemDetailFragment = { quantity: number | null, total: string | null, subtotal: string | null, product: { node:
      | { databaseId: number, name: string | null, slug: string | null, purchaseNote: string | null, image: { sourceUrl: string | null, altText: string | null } | null }
      | { databaseId: number, name: string | null, slug: string | null, purchaseNote: string | null, image: { sourceUrl: string | null, altText: string | null } | null }
      | { databaseId: number, name: string | null, slug: string | null, purchaseNote: string | null, image: { sourceUrl: string | null, altText: string | null } | null }
      | { databaseId: number, name: string | null, slug: string | null, purchaseNote: string | null, image: { sourceUrl: string | null, altText: string | null } | null }
     } | null, variation: { node: { databaseId: number, name: string | null } } | null };

export type AccountDashboardQueryVariables = Exact<{ [key: string]: never; }>;


export type AccountDashboardQuery = { customer: { databaseId: number | null, firstName: string | null, lastName: string | null, displayName: string | null, email: string | null, orderCount: number | null, orders: { nodes: Array<{ databaseId: number | null, orderNumber: string | null, status: OrderStatusEnum | null, date: string | null, total: string | null, needsPayment: boolean | null }> } | null } | null };

export type CustomerOrdersQueryVariables = Exact<{
  first?: number | null | undefined;
  after?: string | null | undefined;
}>;


export type CustomerOrdersQuery = { customer: { orders: { pageInfo: { hasNextPage: boolean, endCursor: string | null }, nodes: Array<{ databaseId: number | null, orderNumber: string | null, status: OrderStatusEnum | null, date: string | null, total: string | null, needsPayment: boolean | null }> } | null } | null };

export type CustomerOrderQueryVariables = Exact<{
  id: string | number;
}>;


export type CustomerOrderQuery = { order: { databaseId: number | null, orderNumber: string | null, status: OrderStatusEnum | null, date: string | null, paymentMethodTitle: string | null, customerNote: string | null, currency: string | null, subtotal: string | null, shippingTotal: string | null, shippingTax: string | null, totalTax: string | null, discountTotal: string | null, total: string | null, needsPayment: boolean | null, billing: { firstName: string | null, lastName: string | null, company: string | null, address1: string | null, address2: string | null, city: string | null, state: string | null, postcode: string | null, country: CountriesEnum | null, email: string | null, phone: string | null } | null, shipping: { firstName: string | null, lastName: string | null, company: string | null, address1: string | null, address2: string | null, city: string | null, state: string | null, postcode: string | null, country: CountriesEnum | null, email: string | null, phone: string | null } | null, lineItems: { nodes: Array<{ quantity: number | null, total: string | null, subtotal: string | null, product: { node:
            | { databaseId: number, name: string | null, slug: string | null, purchaseNote: string | null, image: { sourceUrl: string | null, altText: string | null } | null }
            | { databaseId: number, name: string | null, slug: string | null, purchaseNote: string | null, image: { sourceUrl: string | null, altText: string | null } | null }
            | { databaseId: number, name: string | null, slug: string | null, purchaseNote: string | null, image: { sourceUrl: string | null, altText: string | null } | null }
            | { databaseId: number, name: string | null, slug: string | null, purchaseNote: string | null, image: { sourceUrl: string | null, altText: string | null } | null }
           } | null, variation: { node: { databaseId: number, name: string | null } } | null }> } | null, downloadableItems: { nodes: Array<{ name: string | null, downloadId: string, downloadUrl: string | null, downloadsRemaining: number | null, accessExpires: string | null }> } | null } | null };

export type CustomerAddressesQueryVariables = Exact<{ [key: string]: never; }>;


export type CustomerAddressesQuery = { customer: { firstName: string | null, lastName: string | null, email: string | null, billing: { firstName: string | null, lastName: string | null, company: string | null, address1: string | null, address2: string | null, city: string | null, state: string | null, postcode: string | null, country: CountriesEnum | null, email: string | null, phone: string | null } | null, shipping: { firstName: string | null, lastName: string | null, company: string | null, address1: string | null, address2: string | null, city: string | null, state: string | null, postcode: string | null, country: CountriesEnum | null, email: string | null, phone: string | null } | null } | null };

export type CustomerDetailsQueryVariables = Exact<{ [key: string]: never; }>;


export type CustomerDetailsQuery = { customer: { databaseId: number | null, firstName: string | null, lastName: string | null, displayName: string | null, email: string | null } | null };

export type CustomerDownloadsQueryVariables = Exact<{ [key: string]: never; }>;


export type CustomerDownloadsQuery = { customer: { downloadableItems: { nodes: Array<{ name: string | null, downloadId: string, downloadUrl: string | null, downloadsRemaining: number | null, accessExpires: string | null, product:
          | { databaseId: number, name: string | null, slug: string | null }
          | Record<PropertyKey, never>
         | null }> } | null } | null };

export type UpdateCustomerAddressesMutationVariables = Exact<{
  billing?: CustomerAddressInput | null | undefined;
  shipping?: CustomerAddressInput | null | undefined;
}>;


export type UpdateCustomerAddressesMutation = { updateCustomer: { customer: { billing: { firstName: string | null, lastName: string | null, company: string | null, address1: string | null, address2: string | null, city: string | null, state: string | null, postcode: string | null, country: CountriesEnum | null, email: string | null, phone: string | null } | null, shipping: { firstName: string | null, lastName: string | null, company: string | null, address1: string | null, address2: string | null, city: string | null, state: string | null, postcode: string | null, country: CountriesEnum | null, email: string | null, phone: string | null } | null } | null } | null };

export type UpdateCustomerDetailsMutationVariables = Exact<{
  firstName?: string | null | undefined;
  lastName?: string | null | undefined;
  email?: string | null | undefined;
}>;


export type UpdateCustomerDetailsMutation = { updateCustomer: { customer: { firstName: string | null, lastName: string | null, email: string | null } | null } | null };

export type UpdateCustomerPasswordMutationVariables = Exact<{
  password: string;
}>;


export type UpdateCustomerPasswordMutation = { updateCustomer: { customer: { databaseId: number | null } | null } | null };

export type FacetUniverseQueryVariables = Exact<{ [key: string]: never; }>;


export type FacetUniverseQuery = { products: { nodes: Array<
      | { databaseId: number, name: string | null }
      | { databaseId: number, name: string | null }
      | { databaseId: number, name: string | null }
      | { stockStatus: StockStatusEnum | null, price: string | null, databaseId: number, name: string | null, productCategories: { nodes: Array<{ slug: string | null }> } | null, terms: { nodes: Array<
            | { slug: string | null }
            | { slug: string | null }
            | { slug: string | null }
            | { slug: string | null }
            | { slug: string | null }
            | { slug: string | null }
            | { slug: string | null }
            | { slug: string | null }
            | { slug: string | null }
            | { slug: string | null }
            | { slug: string | null }
            | { slug: string | null }
            | { slug: string | null }
            | { slug: string | null }
            | { slug: string | null }
            | { slug: string | null }
          > } | null, allPaGender: { nodes: Array<{ slug: string | null }> } | null, allPaDrop: { nodes: Array<{ slug: string | null }> } | null, allPaCushioning: { nodes: Array<{ slug: string | null }> } | null, allPaPronation: { nodes: Array<{ slug: string | null }> } | null, allPaWeight: { nodes: Array<{ slug: string | null }> } | null, allPaWidth: { nodes: Array<{ slug: string | null }> } | null, allPaColour: { nodes: Array<{ slug: string | null }> } | null }
    > } | null };

export type ProductBySlugQueryVariables = Exact<{
  slug: string | number;
}>;


export type ProductBySlugQuery = { product:
    | { description: string | null, shortDescription: string | null, onSale: boolean | null, price: string | null, regularPrice: string | null, salePrice: string | null, averageRating: number | null, reviewCount: number | null, externalUrl: string | null, buttonText: string | null, databaseId: number, name: string | null, slug: string | null, type: ProductTypesEnum | null, sku: string | null, featured: boolean | null, reviewsAllowed: boolean | null, dateOnSaleTo: string | null, productCategories: { nodes: Array<{ name: string | null, slug: string | null }> } | null, productBrands: { nodes: Array<{ name: string | null, slug: string | null }> } | null, productTags: { nodes: Array<{ name: string | null, slug: string | null }> } | null, upsell: { nodes: Array<
          | { slug: string | null }
          | { slug: string | null }
          | { slug: string | null }
          | { slug: string | null }
          | { slug: string | null }
        > } | null, image: { sourceUrl: string | null, altText: string | null } | null }
    | { description: string | null, shortDescription: string | null, onSale: boolean | null, price: string | null, addToCartText: string | null, databaseId: number, name: string | null, slug: string | null, type: ProductTypesEnum | null, sku: string | null, featured: boolean | null, reviewsAllowed: boolean | null, dateOnSaleTo: string | null, productCategories: { nodes: Array<{ name: string | null, slug: string | null }> } | null, products: { nodes: Array<
          | { databaseId: number, name: string | null, slug: string | null, type: ProductTypesEnum | null, image: { sourceUrl: string | null, altText: string | null } | null }
          | { databaseId: number, name: string | null, slug: string | null, type: ProductTypesEnum | null, image: { sourceUrl: string | null, altText: string | null } | null }
          | { onSale: boolean | null, price: string | null, regularPrice: string | null, salePrice: string | null, stockStatus: StockStatusEnum | null, stockQuantity: number | null, backorders: BackordersEnum | null, databaseId: number, name: string | null, slug: string | null, type: ProductTypesEnum | null, image: { sourceUrl: string | null, altText: string | null } | null }
          | { databaseId: number, name: string | null, slug: string | null, type: ProductTypesEnum | null, image: { sourceUrl: string | null, altText: string | null } | null }
          | { onSale: boolean | null, price: string | null, regularPrice: string | null, salePrice: string | null, stockStatus: StockStatusEnum | null, stockQuantity: number | null, backorders: BackordersEnum | null, databaseId: number, name: string | null, slug: string | null, type: ProductTypesEnum | null, image: { sourceUrl: string | null, altText: string | null } | null }
        > } | null, productTags: { nodes: Array<{ name: string | null, slug: string | null }> } | null, upsell: { nodes: Array<
          | { slug: string | null }
          | { slug: string | null }
          | { slug: string | null }
          | { slug: string | null }
          | { slug: string | null }
        > } | null, image: { sourceUrl: string | null, altText: string | null } | null }
    | { description: string | null, shortDescription: string | null, onSale: boolean | null, virtual: boolean | null, downloadable: boolean | null, price: string | null, regularPrice: string | null, salePrice: string | null, averageRating: number | null, reviewCount: number | null, stockStatus: StockStatusEnum | null, stockQuantity: number | null, lowStockAmount: number | null, backorders: BackordersEnum | null, soldIndividually: boolean | null, weight: string | null, databaseId: number, name: string | null, slug: string | null, type: ProductTypesEnum | null, sku: string | null, featured: boolean | null, reviewsAllowed: boolean | null, dateOnSaleTo: string | null, productCategories: { nodes: Array<{ name: string | null, slug: string | null }> } | null, productBrands: { nodes: Array<{ name: string | null, slug: string | null }> } | null, allPaDrop: { nodes: Array<{ name: string | null }> } | null, allPaCushioning: { nodes: Array<{ name: string | null }> } | null, allPaPronation: { nodes: Array<{ name: string | null }> } | null, allPaWidth: { nodes: Array<{ name: string | null }> } | null, allPaColour: { nodes: Array<{ name: string | null }> } | null, allPaGender: { nodes: Array<{ name: string | null }> } | null, reviews: { averageRating: number | null, edges: Array<{ rating: number | null, node: { databaseId: number, content: string | null, date: string | null, author: { node:
                | { name: string | null }
                | { name: string | null }
               } | null } }> } | null, galleryImages: { nodes: Array<{ sourceUrl: string | null, altText: string | null }> } | null, productTags: { nodes: Array<{ name: string | null, slug: string | null }> } | null, upsell: { nodes: Array<
          | { slug: string | null }
          | { slug: string | null }
          | { slug: string | null }
          | { slug: string | null }
          | { slug: string | null }
        > } | null, image: { sourceUrl: string | null, altText: string | null } | null }
    | { description: string | null, shortDescription: string | null, onSale: boolean | null, virtual: boolean | null, price: string | null, regularPrice: string | null, salePrice: string | null, averageRating: number | null, reviewCount: number | null, stockStatus: StockStatusEnum | null, stockQuantity: number | null, lowStockAmount: number | null, backorders: BackordersEnum | null, soldIndividually: boolean | null, weight: string | null, databaseId: number, name: string | null, slug: string | null, type: ProductTypesEnum | null, sku: string | null, featured: boolean | null, reviewsAllowed: boolean | null, dateOnSaleTo: string | null, defaultAttributes: { nodes: Array<{ name: string | null, value: string | null }> } | null, productCategories: { nodes: Array<{ name: string | null, slug: string | null }> } | null, productBrands: { nodes: Array<{ name: string | null, slug: string | null }> } | null, allPaDrop: { nodes: Array<{ name: string | null }> } | null, allPaCushioning: { nodes: Array<{ name: string | null }> } | null, allPaPronation: { nodes: Array<{ name: string | null }> } | null, allPaWidth: { nodes: Array<{ name: string | null }> } | null, allPaColour: { nodes: Array<{ name: string | null }> } | null, allPaGender: { nodes: Array<{ name: string | null }> } | null, reviews: { averageRating: number | null, edges: Array<{ rating: number | null, node: { databaseId: number, content: string | null, date: string | null, author: { node:
                | { name: string | null }
                | { name: string | null }
               } | null } }> } | null, galleryImages: { nodes: Array<{ sourceUrl: string | null, altText: string | null }> } | null, attributes: { nodes: Array<
          | { name: string | null, options: Array<string | null> | null, variation: boolean | null }
          | { name: string | null, options: Array<string | null> | null, variation: boolean | null }
        > } | null, variations: { nodes: Array<{ databaseId: number, name: string | null, description: string | null, price: string | null, regularPrice: string | null, salePrice: string | null, onSale: boolean | null, stockStatus: StockStatusEnum | null, stockQuantity: number | null, lowStockAmount: number | null, backorders: BackordersEnum | null, image: { sourceUrl: string | null, altText: string | null } | null, attributes: { nodes: Array<{ name: string | null, value: string | null }> } | null }> } | null, productTags: { nodes: Array<{ name: string | null, slug: string | null }> } | null, upsell: { nodes: Array<
          | { slug: string | null }
          | { slug: string | null }
          | { slug: string | null }
          | { slug: string | null }
          | { slug: string | null }
        > } | null, image: { sourceUrl: string | null, altText: string | null } | null }
   | null };

export type ProductCategoriesQueryVariables = Exact<{
  first?: number | null | undefined;
  slug?: Array<string | null | undefined> | string | null | undefined;
  parent?: number | null | undefined;
  hideEmpty?: boolean | null | undefined;
  orderby?: TermObjectsConnectionOrderbyEnum | null | undefined;
  order?: OrderEnum | null | undefined;
}>;


export type ProductCategoriesQuery = { productCategories: { nodes: Array<{ databaseId: number, name: string | null, slug: string | null, count: number | null, image: { sourceUrl: string | null, altText: string | null } | null }> } | null };

export type ProductTagQueryVariables = Exact<{
  slug: string | number;
}>;


export type ProductTagQuery = { productTag: { name: string | null, slug: string | null, description: string | null, count: number | null } | null };

export type ProductsFilteredQueryVariables = Exact<{
  first?: number | null | undefined;
  search?: string | null | undefined;
  categoryIn?: Array<string | null | undefined> | string | null | undefined;
  productBrandIn?: Array<string | null | undefined> | string | null | undefined;
  attributes?: ProductAttributeQueryInput | null | undefined;
  minPrice?: number | null | undefined;
  maxPrice?: number | null | undefined;
  stockStatus?: Array<StockStatusEnum | null | undefined> | StockStatusEnum | null | undefined;
  visibility?: CatalogVisibilityEnum | null | undefined;
  tagIn?: Array<string | null | undefined> | string | null | undefined;
  slugIn?: Array<string | null | undefined> | string | null | undefined;
  featured?: boolean | null | undefined;
  orderby?: Array<ProductsOrderbyInput | null | undefined> | ProductsOrderbyInput | null | undefined;
}>;


export type ProductsFilteredQuery = { products: { nodes: Array<
      | { onSale: boolean | null, price: string | null, regularPrice: string | null, salePrice: string | null, averageRating: number | null, reviewCount: number | null, databaseId: number, name: string | null, slug: string | null, type: ProductTypesEnum | null, featured: boolean | null, reviewsAllowed: boolean | null, productCategories: { nodes: Array<{ name: string | null, slug: string | null }> } | null, image: { sourceUrl: string | null, altText: string | null } | null }
      | { onSale: boolean | null, price: string | null, averageRating: number | null, reviewCount: number | null, databaseId: number, name: string | null, slug: string | null, type: ProductTypesEnum | null, featured: boolean | null, reviewsAllowed: boolean | null, productCategories: { nodes: Array<{ name: string | null, slug: string | null }> } | null, image: { sourceUrl: string | null, altText: string | null } | null }
      | { onSale: boolean | null, downloadable: boolean | null, price: string | null, regularPrice: string | null, salePrice: string | null, stockStatus: StockStatusEnum | null, stockQuantity: number | null, backorders: BackordersEnum | null, weight: string | null, averageRating: number | null, reviewCount: number | null, databaseId: number, name: string | null, slug: string | null, type: ProductTypesEnum | null, featured: boolean | null, reviewsAllowed: boolean | null, productCategories: { nodes: Array<{ name: string | null, slug: string | null }> } | null, allPaDrop: { nodes: Array<{ name: string | null, slug: string | null }> } | null, allPaCushioning: { nodes: Array<{ name: string | null, slug: string | null }> } | null, allPaPronation: { nodes: Array<{ name: string | null, slug: string | null }> } | null, image: { sourceUrl: string | null, altText: string | null } | null }
      | { onSale: boolean | null, price: string | null, regularPrice: string | null, salePrice: string | null, stockStatus: StockStatusEnum | null, stockQuantity: number | null, backorders: BackordersEnum | null, weight: string | null, averageRating: number | null, reviewCount: number | null, databaseId: number, name: string | null, slug: string | null, type: ProductTypesEnum | null, featured: boolean | null, reviewsAllowed: boolean | null, productCategories: { nodes: Array<{ name: string | null, slug: string | null }> } | null, allPaDrop: { nodes: Array<{ name: string | null, slug: string | null }> } | null, allPaCushioning: { nodes: Array<{ name: string | null, slug: string | null }> } | null, allPaPronation: { nodes: Array<{ name: string | null, slug: string | null }> } | null, image: { sourceUrl: string | null, altText: string | null } | null }
    > } | null };

export type SearchSuggestQueryVariables = Exact<{
  q: string;
  first?: number | null | undefined;
}>;


export type SearchSuggestQuery = { products: { nodes: Array<
      | { databaseId: number, name: string | null, slug: string | null, image: { sourceUrl: string | null, altText: string | null } | null }
      | { databaseId: number, name: string | null, slug: string | null, image: { sourceUrl: string | null, altText: string | null } | null }
      | { price: string | null, stockStatus: StockStatusEnum | null, databaseId: number, name: string | null, slug: string | null, image: { sourceUrl: string | null, altText: string | null } | null }
      | { price: string | null, stockStatus: StockStatusEnum | null, databaseId: number, name: string | null, slug: string | null, image: { sourceUrl: string | null, altText: string | null } | null }
    > } | null, productCategories: { nodes: Array<{ name: string | null, slug: string | null, count: number | null }> } | null };

export type ShopFacetsQueryVariables = Exact<{ [key: string]: never; }>;


export type ShopFacetsQuery = { productCategories: { nodes: Array<{ name: string | null, slug: string | null, count: number | null }> } | null, productBrands: { nodes: Array<{ name: string | null, slug: string | null, count: number | null }> } | null, allPaGender: { nodes: Array<{ name: string | null, slug: string | null, count: number | null }> } | null, allPaDrop: { nodes: Array<{ name: string | null, slug: string | null, count: number | null }> } | null, allPaCushioning: { nodes: Array<{ name: string | null, slug: string | null, count: number | null }> } | null, allPaPronation: { nodes: Array<{ name: string | null, slug: string | null, count: number | null }> } | null, allPaWeight: { nodes: Array<{ name: string | null, slug: string | null, count: number | null }> } | null, allPaWidth: { nodes: Array<{ name: string | null, slug: string | null, count: number | null }> } | null, allPaColour: { nodes: Array<{ name: string | null, slug: string | null, count: number | null }> } | null };

export const OrderAddressFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"OrderAddress"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CustomerAddress"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"firstName"}},{"kind":"Field","name":{"kind":"Name","value":"lastName"}},{"kind":"Field","name":{"kind":"Name","value":"company"}},{"kind":"Field","name":{"kind":"Name","value":"address1"}},{"kind":"Field","name":{"kind":"Name","value":"address2"}},{"kind":"Field","name":{"kind":"Name","value":"city"}},{"kind":"Field","name":{"kind":"Name","value":"state"}},{"kind":"Field","name":{"kind":"Name","value":"postcode"}},{"kind":"Field","name":{"kind":"Name","value":"country"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}}]}}]} as unknown as DocumentNode<OrderAddressFragment, unknown>;
export const OrderCardFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"OrderCard"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Order"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"databaseId"}},{"kind":"Field","name":{"kind":"Name","value":"orderNumber"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"date"}},{"kind":"Field","name":{"kind":"Name","value":"total"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"format"},"value":{"kind":"EnumValue","value":"FORMATTED"}}]},{"kind":"Field","name":{"kind":"Name","value":"needsPayment"}}]}}]} as unknown as DocumentNode<OrderCardFragment, unknown>;
export const LineItemDetailFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"LineItemDetail"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"LineItem"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"quantity"}},{"kind":"Field","name":{"kind":"Name","value":"total"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"format"},"value":{"kind":"EnumValue","value":"FORMATTED"}}]},{"kind":"Field","name":{"kind":"Name","value":"subtotal"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"format"},"value":{"kind":"EnumValue","value":"FORMATTED"}}]},{"kind":"Field","name":{"kind":"Name","value":"product"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"node"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"databaseId"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"purchaseNote"}},{"kind":"Field","name":{"kind":"Name","value":"image"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"sourceUrl"}},{"kind":"Field","name":{"kind":"Name","value":"altText"}}]}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"variation"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"node"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"databaseId"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]}}]} as unknown as DocumentNode<LineItemDetailFragment, unknown>;
export const CartCrossSellsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"CartCrossSells"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"slugIn"}},"type":{"kind":"ListType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"products"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"IntValue","value":"100"}},{"kind":"Argument","name":{"kind":"Name","value":"where"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"slugIn"},"value":{"kind":"Variable","name":{"kind":"Name","value":"slugIn"}}}]}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"nodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Product"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"slug"}}]}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"SimpleProduct"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"crossSell"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"IntValue","value":"16"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"nodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Product"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"slug"}}]}}]}}]}}]}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"VariableProduct"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"crossSell"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"IntValue","value":"16"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"nodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Product"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"slug"}}]}}]}}]}}]}}]}}]}}]}}]} as unknown as DocumentNode<CartCrossSellsQuery, CartCrossSellsQueryVariables>;
export const AccountDashboardDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"AccountDashboard"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"customer"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"databaseId"}},{"kind":"Field","name":{"kind":"Name","value":"firstName"}},{"kind":"Field","name":{"kind":"Name","value":"lastName"}},{"kind":"Field","name":{"kind":"Name","value":"displayName"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"orderCount"}},{"kind":"Field","name":{"kind":"Name","value":"orders"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"IntValue","value":"1"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"nodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"OrderCard"}}]}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"OrderCard"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Order"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"databaseId"}},{"kind":"Field","name":{"kind":"Name","value":"orderNumber"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"date"}},{"kind":"Field","name":{"kind":"Name","value":"total"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"format"},"value":{"kind":"EnumValue","value":"FORMATTED"}}]},{"kind":"Field","name":{"kind":"Name","value":"needsPayment"}}]}}]} as unknown as DocumentNode<AccountDashboardQuery, AccountDashboardQueryVariables>;
export const CustomerOrdersDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"CustomerOrders"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"first"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}},"defaultValue":{"kind":"IntValue","value":"10"}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"after"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"customer"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"orders"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"Variable","name":{"kind":"Name","value":"first"}}},{"kind":"Argument","name":{"kind":"Name","value":"after"},"value":{"kind":"Variable","name":{"kind":"Name","value":"after"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"pageInfo"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"hasNextPage"}},{"kind":"Field","name":{"kind":"Name","value":"endCursor"}}]}},{"kind":"Field","name":{"kind":"Name","value":"nodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"OrderCard"}}]}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"OrderCard"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Order"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"databaseId"}},{"kind":"Field","name":{"kind":"Name","value":"orderNumber"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"date"}},{"kind":"Field","name":{"kind":"Name","value":"total"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"format"},"value":{"kind":"EnumValue","value":"FORMATTED"}}]},{"kind":"Field","name":{"kind":"Name","value":"needsPayment"}}]}}]} as unknown as DocumentNode<CustomerOrdersQuery, CustomerOrdersQueryVariables>;
export const CustomerOrderDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"CustomerOrder"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"order"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"idType"},"value":{"kind":"EnumValue","value":"DATABASE_ID"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"databaseId"}},{"kind":"Field","name":{"kind":"Name","value":"orderNumber"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"date"}},{"kind":"Field","name":{"kind":"Name","value":"paymentMethodTitle"}},{"kind":"Field","name":{"kind":"Name","value":"customerNote"}},{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"subtotal"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"format"},"value":{"kind":"EnumValue","value":"FORMATTED"}}]},{"kind":"Field","name":{"kind":"Name","value":"shippingTotal"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"format"},"value":{"kind":"EnumValue","value":"FORMATTED"}}]},{"kind":"Field","name":{"kind":"Name","value":"shippingTax"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"format"},"value":{"kind":"EnumValue","value":"FORMATTED"}}]},{"kind":"Field","name":{"kind":"Name","value":"totalTax"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"format"},"value":{"kind":"EnumValue","value":"FORMATTED"}}]},{"kind":"Field","name":{"kind":"Name","value":"discountTotal"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"format"},"value":{"kind":"EnumValue","value":"FORMATTED"}}]},{"kind":"Field","name":{"kind":"Name","value":"total"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"format"},"value":{"kind":"EnumValue","value":"FORMATTED"}}]},{"kind":"Field","name":{"kind":"Name","value":"needsPayment"}},{"kind":"Field","name":{"kind":"Name","value":"billing"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"OrderAddress"}}]}},{"kind":"Field","name":{"kind":"Name","value":"shipping"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"OrderAddress"}}]}},{"kind":"Field","name":{"kind":"Name","value":"lineItems"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"nodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"LineItemDetail"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"downloadableItems"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"nodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"downloadId"}},{"kind":"Field","name":{"kind":"Name","value":"downloadUrl"}},{"kind":"Field","name":{"kind":"Name","value":"downloadsRemaining"}},{"kind":"Field","name":{"kind":"Name","value":"accessExpires"}}]}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"OrderAddress"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CustomerAddress"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"firstName"}},{"kind":"Field","name":{"kind":"Name","value":"lastName"}},{"kind":"Field","name":{"kind":"Name","value":"company"}},{"kind":"Field","name":{"kind":"Name","value":"address1"}},{"kind":"Field","name":{"kind":"Name","value":"address2"}},{"kind":"Field","name":{"kind":"Name","value":"city"}},{"kind":"Field","name":{"kind":"Name","value":"state"}},{"kind":"Field","name":{"kind":"Name","value":"postcode"}},{"kind":"Field","name":{"kind":"Name","value":"country"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"LineItemDetail"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"LineItem"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"quantity"}},{"kind":"Field","name":{"kind":"Name","value":"total"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"format"},"value":{"kind":"EnumValue","value":"FORMATTED"}}]},{"kind":"Field","name":{"kind":"Name","value":"subtotal"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"format"},"value":{"kind":"EnumValue","value":"FORMATTED"}}]},{"kind":"Field","name":{"kind":"Name","value":"product"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"node"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"databaseId"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"purchaseNote"}},{"kind":"Field","name":{"kind":"Name","value":"image"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"sourceUrl"}},{"kind":"Field","name":{"kind":"Name","value":"altText"}}]}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"variation"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"node"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"databaseId"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]}}]} as unknown as DocumentNode<CustomerOrderQuery, CustomerOrderQueryVariables>;
export const CustomerAddressesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"CustomerAddresses"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"customer"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"firstName"}},{"kind":"Field","name":{"kind":"Name","value":"lastName"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"billing"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"OrderAddress"}}]}},{"kind":"Field","name":{"kind":"Name","value":"shipping"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"OrderAddress"}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"OrderAddress"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CustomerAddress"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"firstName"}},{"kind":"Field","name":{"kind":"Name","value":"lastName"}},{"kind":"Field","name":{"kind":"Name","value":"company"}},{"kind":"Field","name":{"kind":"Name","value":"address1"}},{"kind":"Field","name":{"kind":"Name","value":"address2"}},{"kind":"Field","name":{"kind":"Name","value":"city"}},{"kind":"Field","name":{"kind":"Name","value":"state"}},{"kind":"Field","name":{"kind":"Name","value":"postcode"}},{"kind":"Field","name":{"kind":"Name","value":"country"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}}]}}]} as unknown as DocumentNode<CustomerAddressesQuery, CustomerAddressesQueryVariables>;
export const CustomerDetailsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"CustomerDetails"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"customer"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"databaseId"}},{"kind":"Field","name":{"kind":"Name","value":"firstName"}},{"kind":"Field","name":{"kind":"Name","value":"lastName"}},{"kind":"Field","name":{"kind":"Name","value":"displayName"}},{"kind":"Field","name":{"kind":"Name","value":"email"}}]}}]}}]} as unknown as DocumentNode<CustomerDetailsQuery, CustomerDetailsQueryVariables>;
export const CustomerDownloadsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"CustomerDownloads"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"customer"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"downloadableItems"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"IntValue","value":"100"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"nodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"downloadId"}},{"kind":"Field","name":{"kind":"Name","value":"downloadUrl"}},{"kind":"Field","name":{"kind":"Name","value":"downloadsRemaining"}},{"kind":"Field","name":{"kind":"Name","value":"accessExpires"}},{"kind":"Field","name":{"kind":"Name","value":"product"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"SimpleProduct"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"databaseId"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}}]}}]}}]}}]}}]}}]}}]} as unknown as DocumentNode<CustomerDownloadsQuery, CustomerDownloadsQueryVariables>;
export const UpdateCustomerAddressesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateCustomerAddresses"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"billing"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"CustomerAddressInput"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"shipping"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"CustomerAddressInput"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateCustomer"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"billing"},"value":{"kind":"Variable","name":{"kind":"Name","value":"billing"}}},{"kind":"ObjectField","name":{"kind":"Name","value":"shipping"},"value":{"kind":"Variable","name":{"kind":"Name","value":"shipping"}}}]}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"customer"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"billing"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"OrderAddress"}}]}},{"kind":"Field","name":{"kind":"Name","value":"shipping"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"OrderAddress"}}]}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"OrderAddress"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CustomerAddress"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"firstName"}},{"kind":"Field","name":{"kind":"Name","value":"lastName"}},{"kind":"Field","name":{"kind":"Name","value":"company"}},{"kind":"Field","name":{"kind":"Name","value":"address1"}},{"kind":"Field","name":{"kind":"Name","value":"address2"}},{"kind":"Field","name":{"kind":"Name","value":"city"}},{"kind":"Field","name":{"kind":"Name","value":"state"}},{"kind":"Field","name":{"kind":"Name","value":"postcode"}},{"kind":"Field","name":{"kind":"Name","value":"country"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}}]}}]} as unknown as DocumentNode<UpdateCustomerAddressesMutation, UpdateCustomerAddressesMutationVariables>;
export const UpdateCustomerDetailsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateCustomerDetails"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"firstName"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"lastName"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"email"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateCustomer"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"firstName"},"value":{"kind":"Variable","name":{"kind":"Name","value":"firstName"}}},{"kind":"ObjectField","name":{"kind":"Name","value":"lastName"},"value":{"kind":"Variable","name":{"kind":"Name","value":"lastName"}}},{"kind":"ObjectField","name":{"kind":"Name","value":"email"},"value":{"kind":"Variable","name":{"kind":"Name","value":"email"}}}]}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"customer"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"firstName"}},{"kind":"Field","name":{"kind":"Name","value":"lastName"}},{"kind":"Field","name":{"kind":"Name","value":"email"}}]}}]}}]}}]} as unknown as DocumentNode<UpdateCustomerDetailsMutation, UpdateCustomerDetailsMutationVariables>;
export const UpdateCustomerPasswordDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateCustomerPassword"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"password"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateCustomer"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"password"},"value":{"kind":"Variable","name":{"kind":"Name","value":"password"}}}]}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"customer"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"databaseId"}}]}}]}}]}}]} as unknown as DocumentNode<UpdateCustomerPasswordMutation, UpdateCustomerPasswordMutationVariables>;
export const FacetUniverseDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"FacetUniverse"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"products"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"IntValue","value":"200"}},{"kind":"Argument","name":{"kind":"Name","value":"where"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"status"},"value":{"kind":"StringValue","value":"publish","block":false}},{"kind":"ObjectField","name":{"kind":"Name","value":"visibility"},"value":{"kind":"EnumValue","value":"CATALOG"}}]}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"nodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"databaseId"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"VariableProduct"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"stockStatus"}},{"kind":"Field","name":{"kind":"Name","value":"price"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"format"},"value":{"kind":"EnumValue","value":"RAW"}}]},{"kind":"Field","name":{"kind":"Name","value":"productCategories"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"nodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"slug"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"terms"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"where"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"taxonomies"},"value":{"kind":"ListValue","values":[{"kind":"EnumValue","value":"PRODUCTBRAND"}]}}]}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"nodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"slug"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"allPaGender"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"nodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"slug"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"allPaDrop"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"nodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"slug"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"allPaCushioning"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"nodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"slug"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"allPaPronation"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"nodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"slug"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"allPaWeight"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"nodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"slug"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"allPaWidth"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"nodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"slug"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"allPaColour"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"nodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"slug"}}]}}]}}]}}]}}]}}]}}]} as unknown as DocumentNode<FacetUniverseQuery, FacetUniverseQueryVariables>;
export const ProductBySlugDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"ProductBySlug"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"slug"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"product"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"slug"}}},{"kind":"Argument","name":{"kind":"Name","value":"idType"},"value":{"kind":"EnumValue","value":"SLUG"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"databaseId"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"sku"}},{"kind":"Field","name":{"kind":"Name","value":"featured"}},{"kind":"Field","name":{"kind":"Name","value":"reviewsAllowed"}},{"kind":"Field","name":{"kind":"Name","value":"dateOnSaleTo"}},{"kind":"Field","name":{"kind":"Name","value":"productTags"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"nodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"upsell"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"IntValue","value":"16"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"nodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"slug"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"image"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"sourceUrl"}},{"kind":"Field","name":{"kind":"Name","value":"altText"}}]}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"VariableProduct"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"shortDescription"}},{"kind":"Field","name":{"kind":"Name","value":"onSale"}},{"kind":"Field","name":{"kind":"Name","value":"virtual"}},{"kind":"Field","name":{"kind":"Name","value":"price"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"format"},"value":{"kind":"EnumValue","value":"FORMATTED"}}]},{"kind":"Field","name":{"kind":"Name","value":"regularPrice"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"format"},"value":{"kind":"EnumValue","value":"FORMATTED"}}]},{"kind":"Field","name":{"kind":"Name","value":"salePrice"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"format"},"value":{"kind":"EnumValue","value":"FORMATTED"}}]},{"kind":"Field","name":{"kind":"Name","value":"averageRating"}},{"kind":"Field","name":{"kind":"Name","value":"reviewCount"}},{"kind":"Field","name":{"kind":"Name","value":"stockStatus"}},{"kind":"Field","name":{"kind":"Name","value":"stockQuantity"}},{"kind":"Field","name":{"kind":"Name","value":"lowStockAmount"}},{"kind":"Field","name":{"kind":"Name","value":"backorders"}},{"kind":"Field","name":{"kind":"Name","value":"soldIndividually"}},{"kind":"Field","name":{"kind":"Name","value":"weight"}},{"kind":"Field","name":{"kind":"Name","value":"defaultAttributes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"nodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"value"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"productCategories"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"nodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"productBrands"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"nodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"allPaDrop"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"nodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"allPaCushioning"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"nodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"allPaPronation"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"nodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"allPaWidth"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"nodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"allPaColour"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"nodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"allPaGender"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"nodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"reviews"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"IntValue","value":"12"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"averageRating"}},{"kind":"Field","name":{"kind":"Name","value":"edges"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"rating"}},{"kind":"Field","name":{"kind":"Name","value":"node"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"databaseId"}},{"kind":"Field","name":{"kind":"Name","value":"content"}},{"kind":"Field","name":{"kind":"Name","value":"date"}},{"kind":"Field","name":{"kind":"Name","value":"author"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"node"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"galleryImages"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"nodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"sourceUrl"}},{"kind":"Field","name":{"kind":"Name","value":"altText"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"attributes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"nodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"options"}},{"kind":"Field","name":{"kind":"Name","value":"variation"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"variations"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"IntValue","value":"100"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"nodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"databaseId"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"price"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"format"},"value":{"kind":"EnumValue","value":"FORMATTED"}}]},{"kind":"Field","name":{"kind":"Name","value":"regularPrice"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"format"},"value":{"kind":"EnumValue","value":"FORMATTED"}}]},{"kind":"Field","name":{"kind":"Name","value":"salePrice"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"format"},"value":{"kind":"EnumValue","value":"FORMATTED"}}]},{"kind":"Field","name":{"kind":"Name","value":"onSale"}},{"kind":"Field","name":{"kind":"Name","value":"stockStatus"}},{"kind":"Field","name":{"kind":"Name","value":"stockQuantity"}},{"kind":"Field","name":{"kind":"Name","value":"lowStockAmount"}},{"kind":"Field","name":{"kind":"Name","value":"backorders"}},{"kind":"Field","name":{"kind":"Name","value":"image"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"sourceUrl"}},{"kind":"Field","name":{"kind":"Name","value":"altText"}}]}},{"kind":"Field","name":{"kind":"Name","value":"attributes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"nodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"value"}}]}}]}}]}}]}}]}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"SimpleProduct"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"shortDescription"}},{"kind":"Field","name":{"kind":"Name","value":"onSale"}},{"kind":"Field","name":{"kind":"Name","value":"virtual"}},{"kind":"Field","name":{"kind":"Name","value":"downloadable"}},{"kind":"Field","name":{"kind":"Name","value":"price"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"format"},"value":{"kind":"EnumValue","value":"FORMATTED"}}]},{"kind":"Field","name":{"kind":"Name","value":"regularPrice"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"format"},"value":{"kind":"EnumValue","value":"FORMATTED"}}]},{"kind":"Field","name":{"kind":"Name","value":"salePrice"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"format"},"value":{"kind":"EnumValue","value":"FORMATTED"}}]},{"kind":"Field","name":{"kind":"Name","value":"averageRating"}},{"kind":"Field","name":{"kind":"Name","value":"reviewCount"}},{"kind":"Field","name":{"kind":"Name","value":"stockStatus"}},{"kind":"Field","name":{"kind":"Name","value":"stockQuantity"}},{"kind":"Field","name":{"kind":"Name","value":"lowStockAmount"}},{"kind":"Field","name":{"kind":"Name","value":"backorders"}},{"kind":"Field","name":{"kind":"Name","value":"soldIndividually"}},{"kind":"Field","name":{"kind":"Name","value":"weight"}},{"kind":"Field","name":{"kind":"Name","value":"productCategories"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"nodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"productBrands"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"nodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"allPaDrop"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"nodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"allPaCushioning"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"nodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"allPaPronation"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"nodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"allPaWidth"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"nodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"allPaColour"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"nodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"allPaGender"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"nodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"reviews"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"IntValue","value":"12"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"averageRating"}},{"kind":"Field","name":{"kind":"Name","value":"edges"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"rating"}},{"kind":"Field","name":{"kind":"Name","value":"node"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"databaseId"}},{"kind":"Field","name":{"kind":"Name","value":"content"}},{"kind":"Field","name":{"kind":"Name","value":"date"}},{"kind":"Field","name":{"kind":"Name","value":"author"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"node"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"galleryImages"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"nodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"sourceUrl"}},{"kind":"Field","name":{"kind":"Name","value":"altText"}}]}}]}}]}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ExternalProduct"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"shortDescription"}},{"kind":"Field","name":{"kind":"Name","value":"onSale"}},{"kind":"Field","name":{"kind":"Name","value":"price"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"format"},"value":{"kind":"EnumValue","value":"FORMATTED"}}]},{"kind":"Field","name":{"kind":"Name","value":"regularPrice"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"format"},"value":{"kind":"EnumValue","value":"FORMATTED"}}]},{"kind":"Field","name":{"kind":"Name","value":"salePrice"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"format"},"value":{"kind":"EnumValue","value":"FORMATTED"}}]},{"kind":"Field","name":{"kind":"Name","value":"averageRating"}},{"kind":"Field","name":{"kind":"Name","value":"reviewCount"}},{"kind":"Field","name":{"kind":"Name","value":"externalUrl"}},{"kind":"Field","name":{"kind":"Name","value":"buttonText"}},{"kind":"Field","name":{"kind":"Name","value":"productCategories"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"nodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"productBrands"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"nodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}}]}}]}}]}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"GroupProduct"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"shortDescription"}},{"kind":"Field","name":{"kind":"Name","value":"onSale"}},{"kind":"Field","name":{"kind":"Name","value":"price"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"format"},"value":{"kind":"EnumValue","value":"FORMATTED"}}]},{"kind":"Field","name":{"kind":"Name","value":"addToCartText"}},{"kind":"Field","name":{"kind":"Name","value":"productCategories"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"nodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"products"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"IntValue","value":"50"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"nodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"databaseId"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"image"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"sourceUrl"}},{"kind":"Field","name":{"kind":"Name","value":"altText"}}]}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"SimpleProduct"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"onSale"}},{"kind":"Field","name":{"kind":"Name","value":"price"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"format"},"value":{"kind":"EnumValue","value":"FORMATTED"}}]},{"kind":"Field","name":{"kind":"Name","value":"regularPrice"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"format"},"value":{"kind":"EnumValue","value":"FORMATTED"}}]},{"kind":"Field","name":{"kind":"Name","value":"salePrice"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"format"},"value":{"kind":"EnumValue","value":"FORMATTED"}}]},{"kind":"Field","name":{"kind":"Name","value":"stockStatus"}},{"kind":"Field","name":{"kind":"Name","value":"stockQuantity"}},{"kind":"Field","name":{"kind":"Name","value":"backorders"}}]}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"VariableProduct"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"onSale"}},{"kind":"Field","name":{"kind":"Name","value":"price"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"format"},"value":{"kind":"EnumValue","value":"FORMATTED"}}]},{"kind":"Field","name":{"kind":"Name","value":"regularPrice"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"format"},"value":{"kind":"EnumValue","value":"FORMATTED"}}]},{"kind":"Field","name":{"kind":"Name","value":"salePrice"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"format"},"value":{"kind":"EnumValue","value":"FORMATTED"}}]},{"kind":"Field","name":{"kind":"Name","value":"stockStatus"}},{"kind":"Field","name":{"kind":"Name","value":"stockQuantity"}},{"kind":"Field","name":{"kind":"Name","value":"backorders"}}]}}]}}]}}]}}]}}]}}]} as unknown as DocumentNode<ProductBySlugQuery, ProductBySlugQueryVariables>;
export const ProductCategoriesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"ProductCategories"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"first"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}},"defaultValue":{"kind":"IntValue","value":"12"}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"slug"}},"type":{"kind":"ListType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"parent"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"hideEmpty"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Boolean"}},"defaultValue":{"kind":"BooleanValue","value":true}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"orderby"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"TermObjectsConnectionOrderbyEnum"}},"defaultValue":{"kind":"EnumValue","value":"COUNT"}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"order"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"OrderEnum"}},"defaultValue":{"kind":"EnumValue","value":"DESC"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"productCategories"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"Variable","name":{"kind":"Name","value":"first"}}},{"kind":"Argument","name":{"kind":"Name","value":"where"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"slug"},"value":{"kind":"Variable","name":{"kind":"Name","value":"slug"}}},{"kind":"ObjectField","name":{"kind":"Name","value":"parent"},"value":{"kind":"Variable","name":{"kind":"Name","value":"parent"}}},{"kind":"ObjectField","name":{"kind":"Name","value":"hideEmpty"},"value":{"kind":"Variable","name":{"kind":"Name","value":"hideEmpty"}}},{"kind":"ObjectField","name":{"kind":"Name","value":"orderby"},"value":{"kind":"Variable","name":{"kind":"Name","value":"orderby"}}},{"kind":"ObjectField","name":{"kind":"Name","value":"order"},"value":{"kind":"Variable","name":{"kind":"Name","value":"order"}}}]}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"nodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"databaseId"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"count"}},{"kind":"Field","name":{"kind":"Name","value":"image"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"sourceUrl"}},{"kind":"Field","name":{"kind":"Name","value":"altText"}}]}}]}}]}}]}}]} as unknown as DocumentNode<ProductCategoriesQuery, ProductCategoriesQueryVariables>;
export const ProductTagDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"ProductTag"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"slug"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"productTag"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"slug"}}},{"kind":"Argument","name":{"kind":"Name","value":"idType"},"value":{"kind":"EnumValue","value":"SLUG"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"count"}}]}}]}}]} as unknown as DocumentNode<ProductTagQuery, ProductTagQueryVariables>;
export const ProductsFilteredDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"ProductsFiltered"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"first"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}},"defaultValue":{"kind":"IntValue","value":"48"}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"search"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"categoryIn"}},"type":{"kind":"ListType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"productBrandIn"}},"type":{"kind":"ListType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"attributes"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"ProductAttributeQueryInput"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"minPrice"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Float"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"maxPrice"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Float"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"stockStatus"}},"type":{"kind":"ListType","type":{"kind":"NamedType","name":{"kind":"Name","value":"StockStatusEnum"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"visibility"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"CatalogVisibilityEnum"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"tagIn"}},"type":{"kind":"ListType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"slugIn"}},"type":{"kind":"ListType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"featured"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Boolean"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"orderby"}},"type":{"kind":"ListType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ProductsOrderbyInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"products"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"Variable","name":{"kind":"Name","value":"first"}}},{"kind":"Argument","name":{"kind":"Name","value":"where"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"status"},"value":{"kind":"StringValue","value":"publish","block":false}},{"kind":"ObjectField","name":{"kind":"Name","value":"search"},"value":{"kind":"Variable","name":{"kind":"Name","value":"search"}}},{"kind":"ObjectField","name":{"kind":"Name","value":"categoryIn"},"value":{"kind":"Variable","name":{"kind":"Name","value":"categoryIn"}}},{"kind":"ObjectField","name":{"kind":"Name","value":"productBrandIn"},"value":{"kind":"Variable","name":{"kind":"Name","value":"productBrandIn"}}},{"kind":"ObjectField","name":{"kind":"Name","value":"attributes"},"value":{"kind":"Variable","name":{"kind":"Name","value":"attributes"}}},{"kind":"ObjectField","name":{"kind":"Name","value":"minPrice"},"value":{"kind":"Variable","name":{"kind":"Name","value":"minPrice"}}},{"kind":"ObjectField","name":{"kind":"Name","value":"maxPrice"},"value":{"kind":"Variable","name":{"kind":"Name","value":"maxPrice"}}},{"kind":"ObjectField","name":{"kind":"Name","value":"stockStatus"},"value":{"kind":"Variable","name":{"kind":"Name","value":"stockStatus"}}},{"kind":"ObjectField","name":{"kind":"Name","value":"visibility"},"value":{"kind":"Variable","name":{"kind":"Name","value":"visibility"}}},{"kind":"ObjectField","name":{"kind":"Name","value":"tagIn"},"value":{"kind":"Variable","name":{"kind":"Name","value":"tagIn"}}},{"kind":"ObjectField","name":{"kind":"Name","value":"slugIn"},"value":{"kind":"Variable","name":{"kind":"Name","value":"slugIn"}}},{"kind":"ObjectField","name":{"kind":"Name","value":"featured"},"value":{"kind":"Variable","name":{"kind":"Name","value":"featured"}}},{"kind":"ObjectField","name":{"kind":"Name","value":"orderby"},"value":{"kind":"Variable","name":{"kind":"Name","value":"orderby"}}}]}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"nodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"databaseId"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"featured"}},{"kind":"Field","name":{"kind":"Name","value":"reviewsAllowed"}},{"kind":"Field","name":{"kind":"Name","value":"image"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"sourceUrl"}},{"kind":"Field","name":{"kind":"Name","value":"altText"}}]}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"VariableProduct"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"onSale"}},{"kind":"Field","name":{"kind":"Name","value":"price"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"format"},"value":{"kind":"EnumValue","value":"FORMATTED"}}]},{"kind":"Field","name":{"kind":"Name","value":"regularPrice"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"format"},"value":{"kind":"EnumValue","value":"FORMATTED"}}]},{"kind":"Field","name":{"kind":"Name","value":"salePrice"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"format"},"value":{"kind":"EnumValue","value":"FORMATTED"}}]},{"kind":"Field","name":{"kind":"Name","value":"stockStatus"}},{"kind":"Field","name":{"kind":"Name","value":"stockQuantity"}},{"kind":"Field","name":{"kind":"Name","value":"backorders"}},{"kind":"Field","name":{"kind":"Name","value":"weight"}},{"kind":"Field","name":{"kind":"Name","value":"averageRating"}},{"kind":"Field","name":{"kind":"Name","value":"reviewCount"}},{"kind":"Field","name":{"kind":"Name","value":"productCategories"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"nodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"allPaDrop"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"nodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"allPaCushioning"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"nodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"allPaPronation"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"nodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}}]}}]}}]}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"SimpleProduct"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"onSale"}},{"kind":"Field","name":{"kind":"Name","value":"downloadable"}},{"kind":"Field","name":{"kind":"Name","value":"price"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"format"},"value":{"kind":"EnumValue","value":"FORMATTED"}}]},{"kind":"Field","name":{"kind":"Name","value":"regularPrice"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"format"},"value":{"kind":"EnumValue","value":"FORMATTED"}}]},{"kind":"Field","name":{"kind":"Name","value":"salePrice"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"format"},"value":{"kind":"EnumValue","value":"FORMATTED"}}]},{"kind":"Field","name":{"kind":"Name","value":"stockStatus"}},{"kind":"Field","name":{"kind":"Name","value":"stockQuantity"}},{"kind":"Field","name":{"kind":"Name","value":"backorders"}},{"kind":"Field","name":{"kind":"Name","value":"weight"}},{"kind":"Field","name":{"kind":"Name","value":"averageRating"}},{"kind":"Field","name":{"kind":"Name","value":"reviewCount"}},{"kind":"Field","name":{"kind":"Name","value":"productCategories"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"nodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"allPaDrop"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"nodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"allPaCushioning"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"nodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"allPaPronation"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"nodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}}]}}]}}]}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ExternalProduct"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"onSale"}},{"kind":"Field","name":{"kind":"Name","value":"price"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"format"},"value":{"kind":"EnumValue","value":"FORMATTED"}}]},{"kind":"Field","name":{"kind":"Name","value":"regularPrice"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"format"},"value":{"kind":"EnumValue","value":"FORMATTED"}}]},{"kind":"Field","name":{"kind":"Name","value":"salePrice"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"format"},"value":{"kind":"EnumValue","value":"FORMATTED"}}]},{"kind":"Field","name":{"kind":"Name","value":"averageRating"}},{"kind":"Field","name":{"kind":"Name","value":"reviewCount"}},{"kind":"Field","name":{"kind":"Name","value":"productCategories"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"nodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}}]}}]}}]}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"GroupProduct"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"onSale"}},{"kind":"Field","name":{"kind":"Name","value":"price"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"format"},"value":{"kind":"EnumValue","value":"FORMATTED"}}]},{"kind":"Field","name":{"kind":"Name","value":"averageRating"}},{"kind":"Field","name":{"kind":"Name","value":"reviewCount"}},{"kind":"Field","name":{"kind":"Name","value":"productCategories"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"nodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}}]}}]}}]}}]}}]}}]}}]} as unknown as DocumentNode<ProductsFilteredQuery, ProductsFilteredQueryVariables>;
export const SearchSuggestDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"SearchSuggest"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"q"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"first"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}},"defaultValue":{"kind":"IntValue","value":"6"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"products"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"Variable","name":{"kind":"Name","value":"first"}}},{"kind":"Argument","name":{"kind":"Name","value":"where"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"search"},"value":{"kind":"Variable","name":{"kind":"Name","value":"q"}}},{"kind":"ObjectField","name":{"kind":"Name","value":"status"},"value":{"kind":"StringValue","value":"publish","block":false}}]}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"nodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"databaseId"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"image"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"sourceUrl"}},{"kind":"Field","name":{"kind":"Name","value":"altText"}}]}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"VariableProduct"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"price"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"format"},"value":{"kind":"EnumValue","value":"FORMATTED"}}]},{"kind":"Field","name":{"kind":"Name","value":"stockStatus"}}]}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"SimpleProduct"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"price"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"format"},"value":{"kind":"EnumValue","value":"FORMATTED"}}]},{"kind":"Field","name":{"kind":"Name","value":"stockStatus"}}]}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"productCategories"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"IntValue","value":"5"}},{"kind":"Argument","name":{"kind":"Name","value":"where"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"search"},"value":{"kind":"Variable","name":{"kind":"Name","value":"q"}}},{"kind":"ObjectField","name":{"kind":"Name","value":"hideEmpty"},"value":{"kind":"BooleanValue","value":true}}]}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"nodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"count"}}]}}]}}]}}]} as unknown as DocumentNode<SearchSuggestQuery, SearchSuggestQueryVariables>;
export const ShopFacetsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"ShopFacets"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"productCategories"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"IntValue","value":"100"}},{"kind":"Argument","name":{"kind":"Name","value":"where"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"hideEmpty"},"value":{"kind":"BooleanValue","value":true}},{"kind":"ObjectField","name":{"kind":"Name","value":"orderby"},"value":{"kind":"EnumValue","value":"NAME"}}]}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"nodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"count"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"productBrands"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"IntValue","value":"100"}},{"kind":"Argument","name":{"kind":"Name","value":"where"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"hideEmpty"},"value":{"kind":"BooleanValue","value":true}}]}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"nodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"count"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"allPaGender"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"IntValue","value":"100"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"nodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"count"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"allPaDrop"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"IntValue","value":"100"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"nodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"count"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"allPaCushioning"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"IntValue","value":"100"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"nodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"count"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"allPaPronation"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"IntValue","value":"100"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"nodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"count"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"allPaWeight"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"IntValue","value":"100"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"nodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"count"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"allPaWidth"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"IntValue","value":"100"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"nodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"count"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"allPaColour"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"IntValue","value":"100"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"nodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"count"}}]}}]}}]}}]} as unknown as DocumentNode<ShopFacetsQuery, ShopFacetsQueryVariables>;