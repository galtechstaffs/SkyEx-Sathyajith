<?php

namespace App\Http\Controllers;

use App\Models\Session;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use GuzzleHttp\Client;
use App\Models\Order;

class OrderController extends Controller
{
    public function createClient($shop, $accessToken)
    {
        $baseURI = "https://$shop/admin/api/2024-10/";

        return new Client([
            'base_uri' => $baseURI,
            'headers' => [
                'Content-Type' => 'application/json',
                'X-Shopify-Access-Token' => $accessToken,
            ],
        ]);
    }


    public function fetchOrder(Request $request)
    {
        $session = $request->get('shopifySession');
        $domain = $session->getShop();

        $accessToken = $session->getAccessToken();
        $shop = Session::where('shop', $domain)
            ->where('access_token', $accessToken)
            ->first();

        if (!$shop) {
            return response()->json(['error' => 'Session not found.'], 404);
        }

        $client = $this->createClient($domain, $accessToken);

        try {

            $response = $client->get("orders.json");
            $result = json_decode($response->getBody(), true);

            foreach ($result['orders'] as &$order){
                $dbOrderDetails = Order::where('client_reference', '#'.$order['order_number'])->first();
                if($dbOrderDetails){
                    $order['awb_no'] = $dbOrderDetails->awb_no;
                }
                else{
                    $order['awb_no'] = null;
                }
            }

            return response()->json($result);

        } catch (Exception $e) {

            return response()->json(['error' => $e->getMessage()]);

        }
    }
}
