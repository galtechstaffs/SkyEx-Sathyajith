<?php

namespace App\Http\Controllers;

use Exception;
use Illuminate\Http\Request;
use GuzzleHttp\Client;
use App\Models\Order;

class ShippingLabelController extends Controller
{
    public function fetchShippingLabel(Request $request)
    {
        $token = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpYXQiOiIxNzI2MDQyNzcyIiwiaXNzIjoiaHR0cHM6Ly9za3lleHByZXNzaW50ZXJuYXRpb25hbC5jb20iLCJhdWQiOiJodHRwczovL3NreWV4cHJlc3NpbnRlcm5hdGlvbmFsLmNvbSIsImV4cCI6IjE4MTI0NDI3NzIiLCJ1bmFtZSI6IlNLWU1BUSIsInVpZCI6ImI3M2Y5Y2M2ZmM1NzRiNTZhMTM2OTNjNzVkMWM4NTk4In0.0g7Ae9NCBAp18Pib8Nt3lM0bzEK-Z_XLh9VvMjnrxuk';

        $orderDetails = $request->json()->all();

        $crf = $orderDetails['ClientReference'];
        $existingOrder = Order::where('client_reference', $crf)->first();

        // return response()->json([
        //     'Order Details' => $crf,
        // ]);

        if (!$existingOrder) {

            $client = new Client();

            $url = 'https://www.skyexpressinternational.com/api/Booking';

            try {
                $response = $client->request('POST', $url, [
                    'headers' => [
                        'Content-Type' => 'application/json',
                        'Authorization' => 'Bearer ' . $token,
                    ],
                    'json' => $orderDetails,
                ]);

                $body = $response->getBody();
                $data = json_decode($body, true);

                $awbNo = $data['AWBNo'];

                $labelURL = 'https://www.skyexpressinternational.com/api/Booking/' . $awbNo;

                $responseLabel = $client->request('GET', $labelURL, [
                    'headers' => [
                        'Content-Type' => 'application/json',
                        'Authorization' => 'Bearer ' . $token,
                    ]
                ]);

                $labelBody = $responseLabel->getBody();
                $labelData = json_decode($labelBody, true);
                // return response()->json($labelData);

                $clientReference = $labelData['ClientReference'];
                $contentDescription = is_array($labelData['ContentDescription'])
                    ? json_encode($labelData['ContentDescription'])
                    : $labelData['ContentDescription'];

                $orderData = $labelData;

                $dumpData = [
                    'awb_no' => $awbNo,
                    'client_reference' => $clientReference,
                    'content_description' => $contentDescription,
                    'order_details' => json_encode($orderData)
                ];

                Order::create($dumpData);

                return response()->json($labelData);
            } catch (Exception $e) {
                return response()->json(['error' => $e->getMessage()]);
            }
        } else {
            return response()->json(['message' => 'Data already exist for order ' . $crf]);
        }
    }

    public function getInvoicePDF(Request $request)
    {
        $token = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpYXQiOiIxNzI2MDQyNzcyIiwiaXNzIjoiaHR0cHM6Ly9za3lleHByZXNzaW50ZXJuYXRpb25hbC5jb20iLCJhdWQiOiJodHRwczovL3NreWV4cHJlc3NpbnRlcm5hdGlvbmFsLmNvbSIsImV4cCI6IjE4MTI0NDI3NzIiLCJ1bmFtZSI6IlNLWU1BUSIsInVpZCI6ImI3M2Y5Y2M2ZmM1NzRiNTZhMTM2OTNjNzVkMWM4NTk4In0.0g7Ae9NCBAp18Pib8Nt3lM0bzEK-Z_XLh9VvMjnrxuk';

        $data = $request->json()->all();
        $awb = $data['awb_no'];

        $client = new Client();

        $url = 'https://www.skyexpressinternational.com/api/AWB/' . $awb;

        try {
            $response = $client->request('GET', $url, [
                'headers' => [
                    'Content-Type' => 'application/json',
                    'Authorization' => 'Bearer ' . $token,
                ]
            ]);

            $body = $response->getBody()->getContents();
            // dd($body);
            // return response()->json($response);
            // $data = json_decode($body, true);
            $base64 = base64_encode($body);

            return response()->json(['pdf_base64' => $base64]);
        } catch (Exception $e) {
            return response()->json(['error' => $e->getMessage()]);
        }
    }

    public function getBulkInvoicePDF(Request $request)
    {
        $token = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpYXQiOiIxNzI2MDQyNzcyIiwiaXNzIjoiaHR0cHM6Ly9za3lleHByZXNzaW50ZXJuYXRpb25hbC5jb20iLCJhdWQiOiJodHRwczovL3NreWV4cHJlc3NpbnRlcm5hdGlvbmFsLmNvbSIsImV4cCI6IjE4MTI0NDI3NzIiLCJ1bmFtZSI6IlNLWU1BUSIsInVpZCI6ImI3M2Y5Y2M2ZmM1NzRiNTZhMTM2OTNjNzVkMWM4NTk4In0.0g7Ae9NCBAp18Pib8Nt3lM0bzEK-Z_XLh9VvMjnrxuk';

        $data = $request->json()->all();
        // $awb = $data['awb_no'];
        $awb_array = $data['awb_array'];

        // return response()->json(['awb_array_return' => $awb_array]);

        $client = new Client();

        $pdfs = [];

        foreach ($awb_array as $awb) {
            $url = 'https://www.skyexpressinternational.com/api/AWB/' . $awb;

            try {
                $response = $client->request('GET', $url, [
                    'headers' => [
                        'Content-Type' => 'application/json',
                        'Authorization' => 'Bearer ' . $token,
                    ]
                ]);

                $body = $response->getBody()->getContents();
                // dd($body);
                // return response()->json($response);
                // $data = json_decode($body, true);
                $base64 = base64_encode($body);

                $pdfs[] = $base64;
                // return response()->json(['pdf_base64' => $base64]);
            } catch (Exception $e) {
                return response()->json(['error' => $e->getMessage()]);
            }
        };

        return response()->json(['pdf_base64_array' => $pdfs]);
    }
}
