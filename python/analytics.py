import json
from pathlib import Path


STORE_PATH = Path(__file__).resolve().parent.parent / "backend" / "data" / "store.json"


def load_store():
    with STORE_PATH.open("r", encoding="utf-8") as handle:
        return json.load(handle)


def rupees(value):
    return f"Rs. {value:,.2f}"


def main():
    store = load_store()
    invoices = store.get("invoices", [])
    customers = store.get("customers", [])

    total_revenue = sum(float(invoice.get("total", 0)) for invoice in invoices)
    pending_balance = sum(float(customer.get("balance", 0)) for customer in customers)

    product_stats = {}
    for invoice in invoices:
        for item in invoice.get("items", []):
            name = item.get("name", "Unknown")
            entry = product_stats.setdefault(name, {"quantity": 0.0, "revenue": 0.0})
            entry["quantity"] += float(item.get("quantity", 0))
            entry["revenue"] += float(item.get("total", 0))

    top_products = sorted(
        product_stats.items(),
        key=lambda pair: pair[1]["revenue"],
        reverse=True
    )[:5]

    print("DAIRY ANALYTICS REPORT")
    print("=" * 50)
    print(f"Customers           : {len(customers)}")
    print(f"Invoices            : {len(invoices)}")
    print(f"Total Revenue       : {rupees(total_revenue)}")
    print(f"Pending Balance     : {rupees(pending_balance)}")
    print()
    print("Top Products")
    print("-" * 50)

    for index, (name, stats) in enumerate(top_products, start=1):
        print(f"{index}. {name:<20} Qty: {stats['quantity']:<8.2f} Revenue: {rupees(stats['revenue'])}")


if __name__ == "__main__":
    main()
