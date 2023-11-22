import React, { useCallback, useEffect, useState } from "react";
import { gql, useLazyQuery, useMutation } from "@apollo/client";
import {
  Image,
  Text,
  SimpleGrid,
  Card,
  CardBody,
  Divider,
  Stack,
  Heading,
  CardFooter,
  ButtonGroup,
  Button,
  CardHeader,
  ListItem,
  List,
  Flex,
  Avatar,
  Box,
  Select
} from "@chakra-ui/react";
import { Helmet } from "react-helmet";
import axios from "axios";

const GET_LIST_PRODUCT = gql`
  query getListProduct($serviceCode: String!, $search: store_ListProductInput) {
    store_listProduct(serviceCode: $serviceCode, search: $search) {
      products {
        name
        image
        id
        currencyCode
        salePrice
        isActive
        description
        cost
        properties
      }
    }
  }
`;

const GET_PRODUCT_BY_ID = gql`
  query getProductById($id: ID!) {
    store_getProductById(id: $id) {
      currencyCode
      description
      id
      name
      salePrice
      cost
      properties
    }
  }
`;

const PSP_FOR_PRODUCt = gql`
  query pspForProduct($productId: ID!) {
    checkout_getPaymentServiceProviderForProduct(productId: $productId) {
      paymentServiceProviders {
        providers {
          id
          deeplink
          additionalBody
          additionalHeader
          issueCurrencies
          info
          name
          label
          requestUrl
          ssnAccountPk
          type
          value
        }
      }
    }
  }
`;

// One Time
const INVOCIE_CREATE_PAYMENT = gql`
  mutation invoiceCreatePayment($input: invoice_CreatePaymentReferenceInput) {
    invoice_createPaymentReference(input: $input) {
      status
      paymentReference {
        amount
        currency
        id
        info
        isUsedStore
        items
        paymentProvider
        notes
        serviceCode
        ssnTxHash
        status
        userId
      }
    }
  }
`;

const CHECKOUT_PSP_DETAIL_FOR_PAYMENT = gql`
  query checkoutPspDetailForPayment($id: ID!, $paymentAddress: String!) {
    checkout_getPaymentServiceProviderDetailForPayment(
      id: $id
      paymentAddress: $paymentAddress
    ) {
      additionalBody
      additionalHeader
      code
      hash
      info
      id
      issueCurrencies
      name
      publicKey
      requestUrl
      signature
      value
      status
      ssnAccountPk
      type
      deeplink
    }
  }
`;

// Pre-auth

const INVOICE_CREATE_INVOICE = gql`
  mutation preAuthCreateInvoice($input: invoice_CreateInvoiceInput) {
    invoice_createInvoice(input: $input) {
      status
      invoice {
        currency
        amount
        info
        id
        isUsedStore
        items
        paymentProvider
        serviceCode
        userId
        ssnTxHash
      }
    }
  }
`;

const ListProduct = () => {
  const [expand, setexpand] = useState(false);
  const [isSelected, setIsSelected] = useState(false);
  const [paymentProvider, setPaymentProvider] = useState({
    name: "",
    id: ""
  });
  const [type, setType] = useState("One Time");
  const [script, setScript] = useState();
  const [getListProduct, { data, loading }] = useLazyQuery(GET_LIST_PRODUCT);
  const [getProductById, { data: reloadData }] = useLazyQuery(
    GET_PRODUCT_BY_ID
  );
  const [getPsp, { data: pspData }] = useLazyQuery(PSP_FOR_PRODUCt);
  const [checkoutPspDetailForPayment, { data: checkoutData }] = useLazyQuery(
    CHECKOUT_PSP_DETAIL_FOR_PAYMENT
  );
  const [inVoiceCreatePayment, { data: invoiceData }] = useMutation(
    INVOCIE_CREATE_PAYMENT
  );
  const [invoiceCreateInvoice, { data: invoiceCreateData }] = useMutation(
    INVOICE_CREATE_INVOICE
  );

  useEffect(() => {
    getListProduct({
      variables: {
        serviceCode: type === "One Time" ? "mysabay_user" : "jx2",
        search: {
          categoryId:
            type === "One Time"
              ? "60d57c4f957fec00196647cc"
              : "6215bc92301fe60e6053c3dd",
          isActive: true
        }
      }
    });
  }, [getListProduct, type]);

  const onClickItem = async (id) => {
    await getProductById({
      variables: {
        id: id
      }
    });
    await getPsp({
      variables: {
        productId: id
      }
    });
    setexpand(true);
  };

  const extractPaymentProvider = useCallback((providers) => {
    return (
      <>
        {providers?.map((item, i) => (
          <Flex
            mb="10"
            style={{ cursor: "pointer" }}
            onClick={() => {
              setIsSelected(true);
              setPaymentProvider({
                id: item.id,
                name: item.name
              });
            }}
            key={i}
          >
            <Avatar
              src={
                item?.info?.logo
                  ? item?.info?.logo
                  : "https://www.acledabank.com.kh/kh/assets/download_material/download-mobileapp-icon.png"
              }
            />
            <Box ml="3">
              <Text>{item.name}</Text>
              <Text>{item.type}</Text>
            </Box>
          </Flex>
        ))}
      </>
    );
  }, []);

  const payNow = useCallback(() => {
    if (type === "One Time") {
      const info = {
        type: "user_top_up",
        value: null,
        service_provider: "mysabay_user",
        user_id: 39555923
      };
      const input = {
        amount: reloadData?.store_getProductById?.salePrice,
        currency: reloadData?.store_getProductById?.currencyCode,
        isUsedStore: true,
        serviceCode: "mysabay_user",
        notes: "",
        ssnTxHash: "",
        paymentProvider: paymentProvider.name,
        items: [{ itemId: reloadData?.store_getProductById?.id, quantity: 1 }],
        info: JSON.stringify(info)
      };
      inVoiceCreatePayment({
        variables: {
          input: input
        }
      })
        .then(async ({ data, errors }) => {
          if (data?.invoice_createPaymentReference) {
            const paymentAddress = `${data?.invoice_createPaymentReference?.paymentReference?.id}:1*invoice-api.master.sabay.com`;
            await checkoutPspDetailForPayment({
              variables: {
                id: paymentProvider.id,
                paymentAddress: paymentAddress
              }
            });
          } else if (errors) {
            alert(errors);
          }
        })
        .catch((error) => {
          console.log(error);
        });
    } else {
      // Pre-auth
      const info = {
        type: "purchase_jpoint",
        value: null,
        service_provider: null,
        user_id: 39555923,
        game_id: "acc_tester"
      };
      const input = {
        amount: parseFloat(reloadData?.store_getProductById?.salePrice),
        currency: "SC",
        isUsedStore: true,
        serviceCode: "jx2",
        notes: "",
        ssnTxHash: "",
        paymentProvider: paymentProvider.name,
        items: [
          {
            itemId: reloadData?.store_getProductById?.id,
            quantity: 1,
            displayName: reloadData?.store_getProductById?.name
          }
        ],
        info: JSON.stringify(info)
      };
      invoiceCreateInvoice({
        variables: {
          input: input
        }
      }).then(async ({ data, errors }) => {
        if (data?.invoice_createInvoice?.invoice) {
          const sabayWalletPaymentAddress = `${
            data?.invoice_createInvoice?.invoice?.id
          }:2*invoice-api.master.sabay.com?req_time=${Math.ceil(
            new Date().getTime() / 1000
          )}`;
          await checkoutPspDetailForPayment({
            variables: {
              id: paymentProvider.id,
              paymentAddress: sabayWalletPaymentAddress
            }
          });
        } else if (errors) {
          alert(errors);
        }
      });
    }
  }, [
    inVoiceCreatePayment,
    reloadData,
    paymentProvider,
    checkoutPspDetailForPayment,
    type,
    invoiceCreateInvoice
  ]);

  const serializeData = function (obj) {
    const str = [];
    for (const p in obj)
      if (Object.prototype.hasOwnProperty.call(obj, p)) {
        str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
      }
    return str.join("&");
  };

  // Pre-auth
  useEffect(() => {
    const paymentAddress = `${
      invoiceCreateData?.invoice_createInvoice?.invoice?.id
    }:2*invoice-api.master.sabay.com?req_time=${Math.ceil(
      new Date().getTime() / 1000
    )}`;
    if (
      checkoutData?.checkout_getPaymentServiceProviderDetailForPayment &&
      type !== "One Time"
    ) {
      const sabayWalletReqUrl = `https://pp.master.mysabay.com/v1/charge/auth/${
        invoiceCreateData?.invoice_createInvoice?.invoice?.id
      }:2*invoice-api.master.sabay.com?req_time=${Math.ceil(
        new Date().getTime() / 1000
      )}`;
      const offGamerWalletReqUrl = `https://offgamer-coin.master.mysabay.com/v1/charge/auth/${
        invoiceCreateData?.invoice_createInvoice?.invoice?.id
      }:2*invoice-api.master.sabay.com?req_time=${Math.ceil(
        new Date().getTime() / 1000
      )}`;
      axios
        .post(
          paymentProvider?.name === "OffGamer Wallet"
            ? offGamerWalletReqUrl
            : sabayWalletReqUrl,
          serializeData({
            hash:
              checkoutData?.checkout_getPaymentServiceProviderDetailForPayment
                ?.hash,
            signature:
              checkoutData?.checkout_getPaymentServiceProviderDetailForPayment
                ?.signature,
            public_key:
              checkoutData?.checkout_getPaymentServiceProviderDetailForPayment
                ?.publicKey,
            payment_address: paymentAddress,
            com_service_code: "jx2"
          }),
          {
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
              "service-code": "mysabay_user",
              Authorization:
                "Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1dWlkIjoiMzUzMTY5MWItZjhiMy00Nzg5LTg0ZDQtN2Y3MDRmMTMzNTQ5IiwiYXBwX2lkIjoibXlzYWJheV91c2VyIiwiZnJvbSI6bnVsbCwiYXVkIjoidXNlciIsInRva2VuX2lkIjoiODA3ZGYyYTktNTZlNi00ZWUzLWE4NzAtOTBjMzA3NTgzZDJhIiwibXlzYWJheV91c2VyX2lkIjozOTU1NTkyMywiZW1haWxfdmVyaWZpZWQiOjEsInBob25lX3ZlcmlmaWVkIjoxLCJ1c2VybmFtZSI6ImFjY190ZXN0ZXIiLCJkaXNwbGF5X25hbWUiOiIgIiwiaWF0IjoxNjg1NDE4MjQwLCJleHAiOjE2ODU0NjE0NDB9.tKge1gNCNXXqGdmZZqYm4B_LVzXIcGUbXDc8O3yqtEaBSYI2ASiMqLOxesjDvUMKk8rhIptvUptwr-N98w0nnQpme4E7r2TyxziCn7t2-jjqm1013QCYWuFRYMvIllE9Z5lGystZ4uV7c1GrUJNtv7LNDDSKlBwjARV11UJvKzzUidRln7P1_tt-l1U0y55j55U-GG291auje72xHx9yTFcAfJWATYqqb-pgB1iz68REkD5nT-5zHUIn_cAMVMijP79O2xwJaA32KagrmaXReVsXxO4KVC8irnR3J6vuxjIMPQI7fxsuohQDMO4WdfQrr4VtSEan4W38b3Esf1mOmv3SenJ4medD-A-olxSeoMcndyFBcAz-0bqu-2Ih5AP3clGomxema7bsxOM3oTeYgIDGxyQCphMXGsq_yfMgRvC818ozUYKhfVwR_Whq6J47MaiOnM-xUgSBREkH1EQQBlVnJSL-kXxtBnGSF0JjkeYVaT16tbg8tcch5WvJ9l7zpY96Cj8Rk6WyiUIb_XgUWHFGQpIn2uv49jOpU19pQSZ79AJvCiqb2q_WpxpnZsHsY88cxSbF6u2pusUFMtsTo9EO3aC2Q66Wd7TdZq51RZ9a4aTD3A9H_3sSpPtY6hldqDvW_CLxHuQdH9qzTMMyU_qC1ClAYg0I4-Gq4y-yI4w"
            }
          }
        )
        .then(function (response) {
          console.log(response);
          alert("success");
        })
        .catch(function (error) {
          console.log(error);
        });
    }
  }, [checkoutData, invoiceCreateData, type, paymentProvider]);

  useEffect(() => {
    if (
      checkoutData?.checkout_getPaymentServiceProviderDetailForPayment &&
      type === "One Time"
    ) {
      const script = document.getElementById("payment").submit();
      setScript(script);
    }
  }, [checkoutData, type]);

  const OnRenderForm = () => {
    const action = `${checkoutData?.checkout_getPaymentServiceProviderDetailForPayment?.requestUrl}${invoiceData?.invoice_createPaymentReference?.paymentReference?.id}:1*invoice-api.master.sabay.com`;
    const paymentAddress = `${invoiceData?.invoice_createPaymentReference?.paymentReference?.id}:1*invoice-api.master.sabay.com`;

    return (
      <div>
        <form
          id="payment"
          name="payment"
          action={action}
          target="_blank"
          method="post"
        >
          <input
            type="hidden"
            id="hash"
            name="hash"
            value={
              checkoutData?.checkout_getPaymentServiceProviderDetailForPayment
                ?.hash
            }
          />
          <input
            type="hidden"
            id="signature"
            name="signature"
            value={
              checkoutData?.checkout_getPaymentServiceProviderDetailForPayment
                ?.signature
            }
          />
          <input
            type="hidden"
            id="public_key"
            name="public_key"
            value={
              checkoutData?.checkout_getPaymentServiceProviderDetailForPayment
                ?.publicKey
            }
          />
          <input
            type="hidden"
            id="payment_address"
            name="payment_address"
            value={paymentAddress}
          />
          <input
            type="hidden"
            id="redirect"
            name="redirect"
            value={`https://mysabay.master.sabay.com/payment-successful?id=${invoiceData?.invoice_createPaymentReference?.paymentReference?.id}`}
          />
          <input type="submit" value="Submit" />
        </form>
      </div>
    );
  };
  const onChangeSelect = useCallback((e) => {
    e.preventDefault();
    setType(e.target.value);
  }, []);

  return (
    <>
      <Helmet>
        <script>{script}</script>
      </Helmet>
      <Select
        mx="50"
        mt="5"
        width="40%"
        placeholder="Select Payment Type"
        onChange={onChangeSelect}
      >
        <option value="One Time">One Time Payment</option>
        <option value="Pre-auth">Pre-auth Payment</option>
      </Select>
      <Text mx="60px" my="60px" fontSize="2xl">
        Product List
      </Text>
      {loading && "Loading"}
      <SimpleGrid
        columns={[1, 2, 3, 5]}
        spacingX="40px"
        spacingY="20px"
        mx="60px"
        my="60px"
      >
        {data?.store_listProduct?.products?.map((item, i) => (
          <Card maxW="md" key={i}>
            <CardBody>
              <Image
                src="https://media-src.sabay.com/mysabay_user/Reload/SBC_40.jpg"
                alt="Green double couch with wooden legs"
                borderRadius="lg"
              />
              <Stack mt="6" spacing="3">
                <Heading size="md">{item.name}</Heading>
                <Text>{item.description}</Text>
                <Text color="blue.600" fontSize="2xl">
                  {item.salePrice}
                  {item.currencyCode}
                </Text>
              </Stack>
            </CardBody>
            <Divider />
            <CardFooter>
              <ButtonGroup spacing="2">
                <Button
                  variant="solid"
                  colorScheme="blue"
                  onClick={() => onClickItem(item.id)}
                >
                  Buy now
                </Button>
              </ButtonGroup>
            </CardFooter>
          </Card>
        ))}
      </SimpleGrid>
      {expand && reloadData && (
        <>
          <hr />
          <Text mx="60px" my="60px" fontSize="2xl">
            Checkout
          </Text>
          <Card variant="filled" align="center" mx="60px" mb="30px">
            <CardHeader>
              <Heading size="md">
                Name: {reloadData?.store_getProductById?.name}
              </Heading>
            </CardHeader>
            <CardBody>
              <Text>
                Desription: {reloadData?.store_getProductById?.description}
              </Text>
              <Text>
                Price: {reloadData?.store_getProductById?.salePrice}{" "}
                {reloadData?.store_getProductById?.currencyCode}
              </Text>
              <Divider colorScheme="teal" />
              <List spacing={3} mt="10">
                {pspData?.checkout_getPaymentServiceProviderForProduct?.paymentServiceProviders?.map(
                  (item, i) => (
                    <ListItem key={i}>
                      {extractPaymentProvider(item?.providers)}
                    </ListItem>
                  )
                )}
              </List>
            </CardBody>
            <CardFooter>
              <Button
                colorScheme="blue"
                isDisabled={!isSelected}
                onClick={payNow}
              >
                Pay Now
              </Button>
            </CardFooter>
          </Card>
        </>
      )}

      {checkoutData?.checkout_getPaymentServiceProviderDetailForPayment &&
        invoiceData?.invoice_createPaymentReference?.paymentReference && (
          <>
            <OnRenderForm />
          </>
        )}
    </>
  );
};

export default ListProduct;

// Note
/* - Signature -Hash -publicKey -requestUrl -redirectUrl*/
