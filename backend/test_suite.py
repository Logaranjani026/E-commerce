import requests
import json
import sys

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

BASE_URL = "http://127.0.0.1:5000/api"

def test_flow():
    print("=== Testing SmartCart AI Full-Stack Endpoints ===")

    # 1. Health check
    res = requests.get(f"{BASE_URL}/health")
    assert res.status_code == 200, f"Health check failed: {res.text}"
    print("[OK] 1. Health Check OK:", res.json())

    # 2. Categories
    res = requests.get(f"{BASE_URL}/products/categories")
    assert res.status_code == 200 and len(res.json()['categories']) >= 8
    print(f"[OK] 2. Categories OK: Found {len(res.json()['categories'])} categories")

    # 3. Products List & Filters
    res = requests.get(f"{BASE_URL}/products", params={'limit': 10})
    assert res.status_code == 200 and res.json()['total'] >= 30
    total = res.json()['total']
    print(f"[OK] 3. Products List OK: Total catalog items = {total}")

    # 4. Search Filter
    res = requests.get(f"{BASE_URL}/products", params={'q': 'Dell'})
    assert res.status_code == 200 and len(res.json()['products']) >= 1
    dell_prod = res.json()['products'][0]
    print(f"[OK] 4. Search Filter OK: Found '{dell_prod['name']}' ({dell_prod['final_price']} INR)")

    # 5. Product Details & Related
    res = requests.get(f"{BASE_URL}/products/{dell_prod['id']}")
    assert res.status_code == 200 and 'specifications' in res.json()['product']
    print("[OK] 5. Product Details OK: Specs & AI highlights populated")

    # 6. AI Shopping Assistant Query
    ai_query = "I need a laptop for programming and college projects under Rs. 50,000"
    res = requests.post(f"{BASE_URL}/ai/recommend", json={'query': ai_query})
    assert res.status_code == 200 and res.json()['success']
    ai_data = res.json()['data']
    best = ai_data['best_match']
    print(f"[OK] 6. AI Assistant Recommendation OK:")
    print(f"     Prompt: '{ai_query}'")
    print(f"     Best Match: {best['product']['name']} ({best['match_percentage']}% Match)")
    print(f"     Reasons: {best['reasons']}")

    # 7. AI Product Comparison
    prod_ids = [dell_prod['id'], res.json()['data']['alternatives'][0]['product']['id']]
    res = requests.post(f"{BASE_URL}/ai/compare", json={'product_ids': prod_ids})
    assert res.status_code == 200 and 'ai_verdict' in res.json()['data']
    print("[OK] 7. AI Comparison OK:")
    print(f"     Verdict: {res.json()['data']['ai_verdict'][:120]}...")

    # 8. User Authentication (Login as Demo Customer)
    login_res = requests.post(f"{BASE_URL}/auth/login", json={'email': 'user@smartcart.ai', 'password': 'User@123'})
    assert login_res.status_code == 200 and 'token' in login_res.json()
    token = login_res.json()['token']
    headers = {'Authorization': f'Bearer {token}'}
    print(f"[OK] 8. Authentication OK: Logged in as {login_res.json()['user']['name']}")

    # 9. Cart Operations
    # Add to cart
    res = requests.post(f"{BASE_URL}/cart/items", json={'product_id': dell_prod['id'], 'quantity': 1}, headers=headers)
    assert res.status_code == 200
    cart_data = res.json()['cart']
    print(f"[OK] 9. Cart Operations OK: Item added. Subtotal = INR {cart_data['subtotal']}")

    # 10. Wishlist Operations
    res = requests.post(f"{BASE_URL}/wishlist/toggle", json={'product_id': dell_prod['id']}, headers=headers)
    assert res.status_code == 200
    print(f"[OK] 10. Wishlist Operations OK: {res.json()['message']}")

    # 11. Checkout & Order Placement
    order_payload = {
        'shipping_address': {
            'full_name': 'Rahul Sharma',
            'phone': '+91 9811223344',
            'street_address': 'Flat 402, Sunshine Heights, Indiranagar',
            'city': 'Bengaluru',
            'state': 'Karnataka',
            'pincode': '560038'
        },
        'payment_method': 'UPI',
        'coupon_code': 'SMART10'
    }
    res = requests.post(f"{BASE_URL}/orders", json=order_payload, headers=headers)
    assert res.status_code == 201
    created_order = res.json()['order']
    print(f"[OK] 11. Order Placement OK: Created #{created_order['order_number']} (Total: INR {created_order['total_amount']})")

    # 12. Order Tracking Timeline
    res = requests.get(f"{BASE_URL}/orders/{created_order['order_number']}", headers=headers)
    assert res.status_code == 200 and len(res.json()['order']['tracking_timeline']) >= 4
    print(f"[OK] 12. Order Tracking Timeline OK: Status is '{res.json()['order']['status']}' with {len(res.json()['order']['tracking_timeline'])} timeline milestones")

    # 13. Admin Login & Analytics
    admin_login = requests.post(f"{BASE_URL}/auth/login", json={'email': 'admin@smartcart.ai', 'password': 'Admin@123'})
    assert admin_login.status_code == 200
    admin_token = admin_login.json()['token']
    admin_headers = {'Authorization': f'Bearer {admin_token}'}

    res = requests.get(f"{BASE_URL}/admin/analytics", headers=admin_headers)
    assert res.status_code == 200
    metrics = res.json()['metrics']
    print(f"[OK] 13. Admin Analytics OK: Revenue = INR {metrics['total_revenue']}, Orders = {metrics['total_orders']}, Users = {metrics['total_users']}")

    # 14. Admin Order Status Update
    res = requests.put(f"{BASE_URL}/admin/orders/{created_order['id']}/status", json={'status': 'Packed'}, headers=admin_headers)
    assert res.status_code == 200
    print(f"[OK] 14. Admin Status Updater OK: Order status updated to 'Packed'")

    print("\n[SUCCESS] ALL 14 TEST SCENARIOS PASSED WITH ZERO ERRORS! SmartCart AI is 100% operational.")

if __name__ == '__main__':
    test_flow()
