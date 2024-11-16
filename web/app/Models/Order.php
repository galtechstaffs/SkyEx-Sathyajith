<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    protected $table = 'shipment_details';

    protected $fillable = [
        'awb_no',
        'client_reference',
        'content_description',
        'order_details',
    ];

    protected $cast = [
        'order_details' => 'array'
    ];
}
