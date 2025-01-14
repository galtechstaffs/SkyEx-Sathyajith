<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\ShippingLabelController;
use App\Http\Controllers\DbDataFetch;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/

Route::get('/', function () {
    return "Hello API";
});

Route::get('/listorders', [OrderController::class, 'fetchOrder'])->middleware('shopify.auth');
Route::post('/shippingLabel', [ShippingLabelController::class, 'fetchShippingLabel']);
Route::post('/getInvoicePDF', [ShippingLabelController::class, 'getInvoicePDF']);
Route::post('/getBulkInvoicePDF', [ShippingLabelController::class, 'getBulkInvoicePDF']);
