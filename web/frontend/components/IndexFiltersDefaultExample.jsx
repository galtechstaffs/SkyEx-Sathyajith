

import {
  TextField,
  IndexTable,
  LegacyCard,
  IndexFilters,
  useSetIndexFiltersMode,
  useIndexResourceState,
  Text,
  ChoiceList,
  RangeSlider,
  Badge,
  Pagination,
  Button,
  Toast,
  Frame,
} from '@shopify/polaris';
import { useState, useCallback, useEffect } from 'react';
import { useAuthenticatedFetch } from "../hooks";
import React from 'react';
import { method } from 'lodash';
import { PDFDocument } from 'pdf-lib';
// import { forEach, method } from 'lodash';

export default function IndexFiltersDefaultExample() {
  const fetch = useAuthenticatedFetch();
  const [orders, setOrders] = useState([]);
  const [ordersFrom, setOrdersFrom] = useState(0);
  const [ordersTo, setOrdersTo] = useState(10);
  const [pagenatedOrders, setPagenatedOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);


  const [toastActive, setToastActive] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const toggleToast = useCallback(() => {
    setToastActive((active) => !active);
  }, []);

  // Add filter-related state
  const [selected, setSelected] = useState(0);
  const [queryValue, setQueryValue] = useState('');
  // const [sortSelected, setSortSelected] = useState(['order-asc']);
  // const [itemStrings, setItemStrings] = useState(['All']);
  const { mode, setMode } = useSetIndexFiltersMode();
  const [priceFilter, setPriceFilter] = useState(null);
  const [paymentFilter, setPaymentFilter] = useState(null);

  const resourceName = {
    singular: 'order',
    plural: 'orders',
  };

  const { selectedResources, allResourcesSelected, handleSelectionChange } =
    useIndexResourceState(filteredOrders);

  const tabs = [
    {
      id: 'all-orders',
      content: 'All',
      accessibilityLabel: 'All orders',
      panelID: 'all-orders-content',
    },
  ];

  // Define filters
  const filters = [
    {
      key: 'price',
      label: 'Price',
      filter: (
        <ChoiceList
          title="Price"
          titleHidden
          choices={[
            { label: 'Under $2000', value: 'under-2000' },
            { label: '$2000 and above', value: 'over-2000' },
          ]}
          selected={priceFilter ? [priceFilter] : []}
          onChange={(value) => {
            setPriceFilter(value[0]);
            applyFilters(value[0], paymentFilter);
          }}
        />
      ),
      shortcut: true,
    },
    {
      key: 'status',
      label: 'Payment Status',
      filter: (
        <ChoiceList
          title="Payment Status"
          titleHidden
          choices={[
            { label: 'Paid', value: 'paid' },
            { label: 'Unpaid', value: 'unpaid' },
          ]}
          selected={paymentFilter ? [paymentFilter] : []}
          onChange={(value) => {
            setPaymentFilter(value[0]);
            applyFilters(priceFilter, value[0]);
          }}
        />
      ),
      shortcut: true,
    },
  ];

  const applyFilters = useCallback((priceFilterValue, paymentFilterValue) => {
    let filtered = [...orders];

    // Apply price filter
    if (priceFilterValue) {
      filtered = filtered.filter((order) => {
        const price = parseFloat(order.total_price);
        if (priceFilterValue === 'under-2000') {
          return price < 2000;
        } else if (priceFilterValue === 'over-2000') {
          return price >= 2000;
        }
        return true;
      });
    }

    // Apply payment status filter
    if (paymentFilterValue) {
      filtered = filtered.filter((order) => {
        const isPaid = order.financial_status === 'paid';
        if (paymentFilterValue === 'paid') {
          return isPaid;
        } else if (paymentFilterValue === 'unpaid') {
          return !isPaid;
        }
        return true;
      });
    }

    setFilteredOrders(filtered);
  }, [orders]);

  // Handle clearing all filters
  const handleFiltersClearAll = useCallback(() => {
    setPriceFilter(null);
    setPaymentFilter(null);
    setFilteredOrders(orders);
  }, [orders]);

  const onHandleCancel = () => {
    setQueryValue('');
    setPriceFilter(null);
    setPaymentFilter(null);
    setFilteredOrders(orders);
  };

  async function getShippingLabel(getLabelOrder) {

    const orderArray = Array.isArray(getLabelOrder) ? getLabelOrder : [getLabelOrder];

    for (const pageOrder of orderArray) {
      const orderDetails = {
        "ClientReference": `#${pageOrder.order_number}`,
        "ConsigneeName": pageOrder.customer.first_name,
        "ConsigneeCompanyName": "sample string 3",
        "ConsigneeAddress1": pageOrder.customer.default_address.address1,
        "ConsigneeAddress2": pageOrder.customer.default_address.address2,
        "ConsigneeAddress3": "sample string 6",
        "ConsigneeCity": pageOrder.customer.default_address.city,
        "ConsigneeState": pageOrder.customer.state,
        "ConsigneePostalCode": pageOrder.customer.default_address.zip,
        "ConsigneeCountryCode": pageOrder.customer.default_address.country_code,
        "ConsigneeTelephone1": pageOrder.customer.phone,
        "ConsigneeFax1": "sample string 12",
        "ReadyAtTime": "00:00:00.1234567",
        "ClosingTime": "00:00:00.1234567",
        "TotalWeight": 13.0,
        "Length": 14.0,
        "Width": 15.0,
        "Height": 16.0,
        "NumberOfItemsThisSize": 17,
        "ItemsCount": 18,
        "ShipmentType": 1,
        "ContentDescription": "Soft and Comfy Latex Pillow. - 1 piece, Queen/Double size 6 pieces, Spring Flower Des",
        "ConsignmentValue": pageOrder.total_price,
        "ConsignmentValueCurrencyCode": pageOrder.presentment_currency,
        "SpecialInstruction": "Soft and Comfy Latex Pillow. - 1 piece, Queen/Double size 6 pieces, Spring Flower Des"
      };

      const url = '/api/shippingLabel';

      try {
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(orderDetails),
        });

        if (!response.ok) {
          console.error('Error, response not OK: ', response);
          setIsError(true);
          setToastMessage(`Error creating shipping label for order #${pageOrder.order_number}`);
          setToastActive(true);
          return;
        }

        const data = await response.json();

        // console.log('Shipment Data: ', data);
        if (data.AWBNo) {
          setIsError(false);
          setToastMessage(`Shipping Label created successfully for order #${pageOrder.order_number}`);
          setToastActive(true);
        }
        else {
          setIsError(true);
          setToastMessage(`Shipping label already created for order #${pageOrder.order_number}.`);
          setToastActive(true);
        }
      }
      catch (error) {
        console.error('Fetch error: ', error);
        setIsError(true);
        setToastMessage(`Error: ${error.message}`);
        setToastActive(true);
        return;
      }
    }
  }


  async function fetchAwbPdf(awbNo) {

    const payload = {
      'awb_no': awbNo
    }

    const url = 'api/getInvoicePDF'
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        console.error('Error, response not OK: ', response);
        return;
      }

      const data = await response.json();

      const base64PDF = data.pdf_base64;

      if (base64PDF) {
        const byteCharacters = atob(base64PDF);
        const byteArray = [];

        for (let offset = 0; offset < byteCharacters.length; offset += 1024) {
          const slice = byteCharacters.slice(offset, offset + 1024);
          const byteNumbers = new Array(slice.length);

          for (let i = 0; i < slice.length; i++) {
            byteNumbers[i] = slice.charCodeAt(i);
          }

          byteArray.push(new Uint8Array(byteNumbers));
        }

        const pdfBlob = new Blob(byteArray, { type: 'application/pdf' });

        const link = document.createElement('a');
        link.href = URL.createObjectURL(pdfBlob);
        link.download = `${awbNo}-invoice.pdf`

        link.click();
      }
      else {
        console.error('No PDF data found in the response.')
      }

      console.log('AWB PDF data: ', data);
    }
    catch (error) {
      console.error('Fetch error: ', error);
      return;
    }
  }


  function fetchOrdersFromFilteredOrders(ids) {
    const i = 0;
    const shippingOrderArray = [];
    for (const id of ids) {
      filteredOrders.map(fo => {
        if (fo.id === id) {
          shippingOrderArray.push(fo);
        }
      })
    }

    getShippingLabel(shippingOrderArray);
    // console.log('Shipping Order Array: ', shippingOrderArray);
  }


  const handleCustomSelectionChange = (selected, id, event) => {
    if (event.target.type === 'checkbox') {
      // Explicit checkbox click
      handleSelectionChange(selected, id);
    }
  };


  function printRows() {
    // console.log(pagenatedOrders);
    if (pagenatedOrders) {
      const rowMarkup = pagenatedOrders.map((pageOrder, index) => (
        <IndexTable.Row
          id={pageOrder.id}
          key={pageOrder.id}
          selected={selectedResources.includes(pageOrder.id)}
          position={index}
          onClick={(event) => handleCustomSelectionChange(null, pageOrder.id, event)}
          onSelect={(selected) => handleCustomSelectionChange(selected, pageOrder.id)}
        >
          <IndexTable.Cell>
            <Text variant="bodyMd" fontWeight="bold" as="span">
              {pageOrder.order_number}
            </Text>
          </IndexTable.Cell>
          <IndexTable.Cell>{pageOrder.updated_at}</IndexTable.Cell>
          <IndexTable.Cell>{pageOrder.shipping_address.first_name}</IndexTable.Cell>
          <IndexTable.Cell>${parseFloat(pageOrder.total_price).toFixed(2)}</IndexTable.Cell>
          <IndexTable.Cell>
            <Badge status={pageOrder.financial_status === 'paid' ? 'success' : 'warning'}>
              {pageOrder.financial_status}
            </Badge>
          </IndexTable.Cell>
          <IndexTable.Cell>
            <Button
              primary
              onClick={() => getShippingLabel(pageOrder)}
              disabled={selectedResources.length > 0}
            >
              Push to SkyEx
            </Button>
          </IndexTable.Cell>
          <IndexTable.Cell>
            <Text variant="bodyMd" fontWeight="bold" as="span">
              {pageOrder.awb_no}
            </Text>
          </IndexTable.Cell>
          <IndexTable.Cell>
            {pageOrder.awb_no && (
              <Button
                primary
                onClick={() => fetchAwbPdf(pageOrder.awb_no)}
                disabled={selectedResources.length > 0}
              >
                Download
              </Button>
            )}
          </IndexTable.Cell>
        </IndexTable.Row>
      ))
      return rowMarkup;
    }
  }

  function previousClicked() {
    if (ordersFrom === 0) {
      setOrdersFrom(0);
      setOrdersTo(10);

      setPagenatedOrders(
        filteredOrders.length > 0
          ? filteredOrders.slice(ordersFrom, ordersTo)
          : orders.slice(ordersFrom, ordersTo)
      );
    }
    else {
      setOrdersFrom(ordersFrom - 10);
      setOrdersTo(ordersTo - 10);

      setPagenatedOrders(
        filteredOrders.length > 0
          ? filteredOrders.slice(ordersFrom - 10, ordersTo - 10)
          : orders.slice(ordersFrom, ordersTo)
      );
    }
  }

  function nextClicked() {
    if (ordersTo >= filteredOrders.length) {
      setOrdersTo(ordersTo);
      setOrdersFrom(ordersFrom);

      setPagenatedOrders(
        filteredOrders.length > 0
          ? filteredOrders.slice(ordersFrom, ordersTo)
          : orders.slice(ordersFrom, ordersTo)
      );
    }
    else {
      setOrdersFrom(ordersFrom + 10);
      setOrdersTo(ordersTo + 10);

      setPagenatedOrders(
        filteredOrders.length > 0
          ? filteredOrders.slice(ordersFrom + 10, ordersTo + 10)
          : orders.slice(ordersFrom, ordersTo)
      );
    }
  }

  async function prepareBulkOrderDownload() {

    const awbArray = []

    selectedResources.map(orderID => {
      filteredOrders.map(fo => {
        if (fo['id'] === orderID) {
          if (fo['awb_no']) {
            awbArray.push(fo['awb_no'])
          }
        }
      })
    });

    console.log(awbArray);

    const url = 'api/getBulkInvoicePDF'

    const payload = {
      'awb_array': awbArray
    }

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        console.error('Error, response not OK: ', response);
        return;
      }

      const data = await response.json();

      const base64PDF = data.pdf_base64_array;

      console.log('base64PDF', base64PDF);

      if (base64PDF.length > 0) {
        console.log('Inside if(base64PDF)')

        const mergePdf = await PDFDocument.create();

        for(const pdf of base64PDF){
          const pdfBytes = Uint8Array.from(atob(pdf), (c) => c.charCodeAt(0));

          const pdfDoc = await PDFDocument.load(pdfBytes);

          const copiedPages = await mergePdf.copyPages(pdfDoc, pdfDoc.getPageIndices());
          copiedPages.forEach((page) => mergePdf.addPage(page));
        }

        const mergePdfBytes = await mergePdf.save();

        const pdfBlob = new Blob([mergePdfBytes], { type: 'application/pdf' });

        const link = document.createElement('a');
        link.href = URL.createObjectURL(pdfBlob);
        link.download = `consolidated-Airway-bill(${base64PDF.length}-nos).pdf`

        link.click();
      }
      else {
        console.error('No PDF data found in the response.')
      }

      // console.log('AWB PDF data: ', data);
    }
    catch (error) {
      console.error('Fetch error: ', error);
      return;
    }
  };

  useEffect(() => {
    const fetchOrders = async () => {
      const url = '/api/listorders';
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        console.log('Response in error: ', response)
        throw new Error(`HTTP error. Status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Fetched Data: ', data);

      setOrders(data['orders']);
      setFilteredOrders(data['orders']);
    };

    fetchOrders();
  }, []);

  useEffect(() => {
    setPagenatedOrders(orders ? orders.slice(0, 10) : [])
  }, [orders])

  useEffect(() => {
    setPagenatedOrders(filteredOrders ? filteredOrders.slice(0, 10) : [])
  }, [filteredOrders])

  return (
    <LegacyCard>
      <IndexFilters
        tabs={tabs}
        selected={selected}
        onSelect={setSelected}
        filters={filters}
        queryValue={queryValue}
        queryPlaceholder="Search orders"
        onQueryChange={setQueryValue}
        onQueryClear={() => setQueryValue('')}
        onClearAll={handleFiltersClearAll}
        mode={mode}
        setMode={setMode}
      />
      <IndexTable
        resourceName={resourceName}
        itemCount={filteredOrders.length}
        // selectedItemsCount={selectedResources.length}
        selectedItemsCount={
          allResourcesSelected ? 'All' : selectedResources.length
        }
        onSelectionChange={handleSelectionChange}
        // onSelectionChange={(selected, id) => handleCustomSelectionChange(selected, id)}
        headings={[
          { title: 'Order' },
          { title: 'Date' },
          { title: 'Customer' },
          { title: 'Total' },
          { title: 'Payment status' },
          { title: 'Push To SkyEx' },
          { title: 'AWB No' },
          { title: 'Download' },
        ]}
        promotedBulkActions={[
          {
            content: 'Bulk Push to SkyEx',
            status: 'info',
            primary: true,
            onAction: () => {
              fetchOrdersFromFilteredOrders(selectedResources);
              // console.log('Selected items:', selectedResources);
            },
          },
          {
            content: 'Bulk Download Airway Bills',
            onAction: () => {
              // console.log('Selected items:', selectedResources);
              prepareBulkOrderDownload(selectedResources);
            }
          }
        ]}
      >
        {printRows()}
        <Pagination
          hasPrevious={ordersFrom > 0}
          onPrevious={() => {
            // console.log('Previous');
            previousClicked();
          }}
          hasNext={ordersTo < filteredOrders.length}
          onNext={() => {
            // console.log('Next');
            nextClicked();
          }}
        />

        {toastActive && (
          <Frame>
            <Toast
              content={toastMessage}
              error={isError}
              onDismiss={toggleToast}
              duration={4000}
            />
          </Frame>
        )}
      </IndexTable>
    </LegacyCard>
  );
}