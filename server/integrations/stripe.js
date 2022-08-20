const {STRIPE_SECRET_KEY, STRIPE_GROUP_CLASS_PRICE_ID, WEB_ADDRESS} = require("../config");
const { sanitize_statement_descriptor } = require("../functions/utils");
const stripe = require("stripe")(STRIPE_SECRET_KEY);

async function create_stripe_session({customer_email, line_items=[], mode="payment", success_url=WEB_ADDRESS, cancel_url=WEB_ADDRESS, billing_address_collection="auto", automatic_tax={enabled: true}}){
    try{
        const session = await stripe.checkout.sessions.create({
            customer_email,
            line_items,
            mode,
            success_url,
            cancel_url,
            billing_address_collection,
            automatic_tax
        });

        return session;
    }catch(e){
        throw e;
    }
}

async function create_stripe_payment_intent({amount, currency="usd", customer, description, metadata, off_session=false, confirm=false, receipt_email, payment_method, payment_method_types=["card"], setup_future_usage="off_session", statement_descriptor="MERN SCHOOL FEE", capture_method="automatic", return_url=WEB_ADDRESS}){
    try{
        let payment_method_type_obj = {automatic_payment_methods: {enabled: true}};

        let return_url_obj = {};

        if(payment_method_types){
            payment_method_type_obj = {payment_method_types};
        }

        if(confirm){
            return_url_obj = {return_url};
        }

        const paymentIntent = await stripe.paymentIntents.create({
            amount,
            currency,
            customer,
            description,
            statement_descriptor: sanitize_statement_descriptor(statement_descriptor),
            payment_method,
            // payment_method_types,
            receipt_email,
            setup_future_usage,
            capture_method,
            // return_url,
            ...return_url_obj,
            off_session,
            metadata,
            confirm,
            ...payment_method_type_obj
            // automatic_payment_methods: {enabled: true}
        });

        return paymentIntent;
    }catch(e){
        throw e;
    }
}

async function get_payment_intent(payment_intent_id){
    try{
        const payment_intent = await stripe.paymentIntents.retrieve(payment_intent_id);

        return payment_intent;
    }catch(e){
        throw e;
    }
}

async function capture_stripe_payment_intent(payment_intent_id, amount){
    try{
        const payment_intent = await get_payment_intent(payment_intent_id);

        if(payment_intent){
            if(payment_intent.status === "requires_capture"){
                const stripe_capture = await stripe.paymentIntents.capture(payment_intent_id, {amount_to_capture: amount || payment_intent.amount_capturable});

                return stripe_capture;
            }else{
                throw new Error("Payment Has already been captured or cancelled");
            }
        }else{
            throw new Error("Payment intent not found");
        }
    }catch(e){
        throw e;
    }
}

async function cancel_stripe_payment_intent(payment_intent_id){
    try{
        const payment_intent = await stripe.paymentIntents.cancel(payment_intent_id);

        return payment_intent;
    }catch(e){
        throw e;
    }
}

async function get_stripe_customer(customer_id){
    try{
        const customer = await stripe.customers.retrieve(customer_id);

        return customer;
    }catch(e){
        throw e;
    }   
}

async function create_stripe_customer({email, name, description, phone, address, shipping}){
    try{
        const customer = await stripe.customers.create({
            email,
            name,
            phone,
            description,
            address,
            shipping
        });

        return customer;
    }catch(e){
        throw e;
    }
}

async function update_stripe_customer(customer_id, updated_properties){
    try{
        delete updated_properties.id;
    
        const updated_customer = await stripe.customers.update(customer_id, updated_properties);
    
        return updated_customer;
    }catch(e){
        throw e;
    }
}

async function delete_stripe_customer(customer_id){
    try{
        const res = await stripe.customers.del(customer_id);

        return res;
    }catch(e){
        throw e;
    }
}

async function add_source_to_stripe_customer(customer_id, source_id){
    try{
        const source = await stripe.customers.createSource(customer_id, {source: source_id});

        return source;
    }catch(e){
        throw e;
    }
}

async function get_stripe_customer_sources(customer_id, type="card", limit=100, offset=0){
    const offset_obj = {};

    if(offset<0){
        offset_obj.ending_before = offset * -1;
    }

    if(offset > 0){
        offset_obj.starting_after = offset;
    }
    
    try{
        const sources = await stripe.customers.listSources(customer_id, {object: type, limit, ...offset_obj});

        return sources;
    }catch(e){
        throw e;
    }
}

async function get_stripe_products(limit=10, offset=0, additional_filters={}){
    try{
        const offset_obj = {};

        if(offset<0){
            offset_obj.ending_before = offset * -1;
        }

        if(offset > 0){
            offset_obj.starting_after = offset;
        }
        
        const product = await stripe.products.list({
            limit,
            ...offset,
            ...additional_filters
        });
        
        return product;
    }catch(e){
        throw e;
    }
}

async function get_stripe_product(product_id){
    try{
        const product = await stripe.products.retrieve(product_id);
        
        return product;
    }catch(e){
        throw e;
    }
}

async function create_stripe_product({name, description, active=true, default_price_data={currency: "usd", unit_amount: 100, recurring: false, tax_behavior: "unspecified"}, metadata, images=[], shippable=false, statement_descriptor, tax_code, unit_label, url, package_dimensions}){
    try{
        const product = await stripe.products.create({
            name,
            description,
            images,
            url,
            active,
            unit_label,
            default_price_data,
            statement_descriptor,
            package_dimensions,
            shippable,
            tax_code,
            metadata
        });
        
        return product;
    }catch(e){
        throw e;
    }
}

async function update_stripe_product(product_id, updated_props){
    try{
        const updated_product = await stripe.products.update(product_id, updated_props);
        
        return updated_product;
    }catch(e){
        throw e;
    }
}

async function delete_stripe_product(product_id){
    try{
        const res = await stripe.products.del(product_id);
        
        return res;
    }catch(e){
        throw e;
    }
}

module.exports.get_payment_intent = get_payment_intent;
module.exports.get_stripe_product = get_stripe_product;
module.exports.get_stripe_customer = get_stripe_customer;
module.exports.get_stripe_products = get_stripe_products;
module.exports.create_stripe_session = create_stripe_session;
module.exports.create_stripe_product = create_stripe_product;
module.exports.update_stripe_product = update_stripe_product;
module.exports.delete_stripe_product = delete_stripe_product;
module.exports.create_stripe_customer = create_stripe_customer;
module.exports.update_stripe_customer = update_stripe_customer;
module.exports.delete_stripe_customer = delete_stripe_customer;
module.exports.get_stripe_customer_sources = get_stripe_customer_sources;
module.exports.cancel_stripe_payment_intent = cancel_stripe_payment_intent;
module.exports.create_stripe_payment_intent = create_stripe_payment_intent;
module.exports.add_source_to_stripe_customer = add_source_to_stripe_customer;
module.exports.capture_stripe_payment_intent = capture_stripe_payment_intent;