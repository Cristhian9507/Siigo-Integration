const apiWoocommerce = require("../config/configWoocommerce");
const { woocommerceProductFindBySku } = require("../services/woocommerceService");
const { printJson } = require("../utils/utils");


const convertProductToWoocommerce = async (product) => {
  const woocommerceProduct = {
    sku: product.code,
    type: 'simple',
    name: product.name,
    regular_price: product.prices[0].price_list[0].value,
    stock_status: (product.stock_control && product.available_quantity > 0) ? 'instock' : 'outofstock',
    manage_stock: product.stock_control,
    stock_quantity: product.stock_control ? product.available_quantity : 0,
    status: product.active ? 'publish' : 'draft',
  };
  return woocommerceProduct;
}
// Convertimos la data que viene de Siigo a un formato que Woocommerce entienda
const convertDataToUpdateStockWoocommerce = async (product) => {
  const woocommerceStockProduct = {
    sku: product.code,
    type: 'simple',
    name: product.name,
    stock_status: (product.stock_control && product.available_quantity > 0) ? 'instock' : 'outofstock',
    manage_stock: product.stock_control,
    stock_quantity: product.stock_control ? product.available_quantity : 0,
  };
  return woocommerceStockProduct;
}

const sendProductToWoocommerce = async (newWoocommerceProduct) => {
  let responseRequest;
  try {
    responseRequest = await apiWoocommerce.post(`products`, newWoocommerceProduct)
      .then((response) => {
        return response.data;
      })
      .catch((error) => {
        console.log("Response Status:", error.response.status);
        console.log("Response Headers:", error.response.headers);
        console.log("Response Data:", error.response.data);
        return error.response.data;
      });
    console.log("### Producto creado en Woocommerce ###");
    printJson(responseRequest);
  } catch (error) {
    console.log("### Error al enviar el producto a Woocommerce ###");
    printJson(error.response);
  }
}

const processProduct = async (product) => {
  //1. hacer el log de toda la informacion del producto recibida en la bd
  console.log("### Procesando producto...###");
  printJson(product);

  //2. buscar el producto en woocommerce
  console.log("### Va a buscar producto en WooCommerce ###");
  const woocommerceProduct = await woocommerceProductFindBySku(product.resources[0].code);
  if (woocommerceProduct) {
    console.log("### Producto ya existe en WooCommerce ###");
    return;
  }

  // //3. convertir el producto a un formato que woocommerce entienda
  const newWoocommerceProduct = await convertProductToWoocommerce(product.resources[0]);
  console.log("### producto convertido a Woocommerce ###");
  printJson(newWoocommerceProduct);

  //4. enviar el producto a woocommerce
  woocommerceResponse = await sendProductToWoocommerce(newWoocommerceProduct);
}

const processUpdateProduct = async (product) => {
  //1. hacer el log de toda la informacion del producto recibida en la bd
  console.log("### Procesando producto para actualizar...###");
  printJson(product);

  //2. buscar el producto en woocommerce
  console.log("### Va a buscar producto en WooCommerce ###");
  const woocommerceProduct = await woocommerceProductFindBySku(product.resources[0].code);
  const woocommerceProductId = woocommerceProduct != undefined ? woocommerceProduct[0].id : null;
  if (woocommerceProductId) {
    console.log("### Producto SI existe en WooCommerce ###");
    console.log("### Se procederá a actualizar ###");
    //3. convertir el producto a un formato que woocommerce entienda
    const updateWoocommerceProduct = await convertProductToWoocommerce(product.resources[0]);
    console.log("### producto convertido a Woocommerce ###");
    printJson(updateWoocommerceProduct);

    //4. enviar el producto a woocommerce
    woocommerceResponse = await updateProductToWoocommerce(woocommerceProductId, updateWoocommerceProduct);
    return;
  } else {

  }
}

const updateStockProductToWoocommerce = async(woocommerceProductId, stockProductWoocommerce) => {
  let responseRequest;
  try {
    responseRequest = await apiWoocommerce.put(`products/${woocommerceProductId}`, stockProductWoocommerce)
      .then((response) => {
        return response.data;
      })
      .catch((error) => {
        console.log("Response Status:", error.response.status);
        console.log("Response Headers:", error.response.headers);
        console.log("Response Data:", error.response.data);
        return error.response.data;
      });
    console.log("### Stock del Producto actualizado en Woocommerce ###");
    printJson(responseRequest);
  } catch (error) {
    console.log("### Error al actualizar el stocl del producto en Woocommerce ###");
    printJson(error.response);
  }
}

// actualizar información como name. precio.
const updateProductToWoocommerce = async(woocommerceProductId, changesProductWoocommerce) => {
  let responseRequest;
  try {
    responseRequest = await apiWoocommerce.put(`products/${woocommerceProductId}`, changesProductWoocommerce)
      .then((response) => {
        return response.data;
      })
      .catch((error) => {
        console.log("Response Status:", error.response.status);
        console.log("Response Headers:", error.response.headers);
        console.log("Response Data:", error.response.data);
        return error.response.data;
      });
    console.log("### update del Producto realizado en Woocommerce ###");
    printJson(responseRequest);
  } catch (error) {
    console.log("### Error al actualizar el producto en Woocommerce ###");
    printJson(error.response);
  }
}

const processUpdateStockProduct = async (product) => {
  //1. hacer el log de toda la informacion del producto recibida en la bd
  console.log("### Procesando producto...###");
  printJson(product);

  //2. buscar el producto en woocommerce
  console.log("### Va a buscar producto en WooCommerce ###");
  const woocommerceProduct = await woocommerceProductFindBySku(product.resources[0].code);
  const woocommerceProductId = woocommerceProduct != undefined ? woocommerceProduct[0].id : null;
  if (woocommerceProductId) {
    console.log("### Producto SI existe en WooCommerce ###");
    console.log("### Se actualizará el stock ###");
    const dataStockProduct = await convertDataToUpdateStockWoocommerce(product.resources[0]);
    console.log("### producto convertido a Woocommerce ###");
    woocommerceResponse = await updateStockProductToWoocommerce(woocommerceProductId, dataStockProduct);
  } else {
    console.log("### NO existe Producto WooCommerce ###");
    console.log("### Se procede a gestionar producto para su creación ###");
    await processProduct(product);
  }
}

module.exports = 
{
  processProduct,
  processUpdateProduct,
  processUpdateStockProduct
}
