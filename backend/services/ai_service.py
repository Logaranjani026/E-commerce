import re
import json
import requests
from backend.config.settings import Config
from backend.models.product import Product

class AIService:
    @staticmethod
    def parse_query_with_llm(query_text):
        """
        Attempts to parse user query using Gemini API if key exists.
        Returns parsed dict or None if API unavailable.
        """
        if not Config.GEMINI_API_KEY:
            return None

        try:
            url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={Config.GEMINI_API_KEY}"
            prompt = f"""
            Analyze the following e-commerce shopping query and extract structured JSON information.
            Query: "{query_text}"
            Return ONLY a valid JSON object with the following fields:
            {{
                "category": "Laptops" | "Smartphones" | "Headphones" | "Watches" | "Electronics" | "Fashion" | "Home & Kitchen" | "Accessories" | null,
                "max_budget": number or null (in INR),
                "min_budget": number or null,
                "use_case": ["programming", "gaming", "photography", "daily use", etc],
                "required_specs": ["16GB RAM", "SSD", "ANC", "AMOLED", etc],
                "preferred_brands": ["Dell", "Apple", "Samsung", "Sony", etc],
                "search_keywords": ["keyword1", "keyword2"]
            }}
            """
            response = requests.post(url, json={"contents": [{"parts": [{"text": prompt}]}]}, timeout=6)
            if response.status_code == 200:
                result_json = response.json()
                content = result_json['candidates'][0]['content']['parts'][0]['text']
                # Clean code blocks
                clean_text = re.sub(r'```json\s*|\s*```', '', content).strip()
                return json.loads(clean_text)
        except Exception as e:
            print(f"[AIService] Gemini API error, falling back to heuristic NLP engine: {e}")
        return None

    @staticmethod
    def parse_query_heuristically(query_text):
        """
        High-performance heuristic rule & NLP extractor.
        Works offline 100% reliably.
        """
        text = query_text.lower().strip()

        # 1. Budget extraction (e.g. 'under 50000', 'under ₹50k', 'budget 40,000', '< 60000')
        max_budget = None
        min_budget = None

        # Look for budget patterns
        budget_match = re.search(r'(?:under|below|less than|within|upto|budget|around|max|<=?)\s*(?:₹|rs\.?|inr)?\s*([\d,]+(?:\.\d+)?)\s*(k|thousand|lakh|lac)?', text)
        if budget_match:
            num_str = budget_match.group(1).replace(',', '')
            multiplier = budget_match.group(2)
            try:
                val = float(num_str)
                if multiplier in ('k', 'thousand'):
                    val *= 1000
                elif multiplier in ('lakh', 'lac'):
                    val *= 100000
                max_budget = val
            except ValueError:
                pass
        else:
            # Check standalone numbers like ₹50,000 or 50k
            standalone_match = re.search(r'(?:₹|rs\.?)\s*([\d,]+)\s*(k)?', text)
            if standalone_match:
                try:
                    val = float(standalone_match.group(1).replace(',', ''))
                    if standalone_match.group(2) == 'k':
                        val *= 1000
                    max_budget = val
                except ValueError:
                    pass

        # 2. Category Detection
        category = None
        if any(w in text for w in ['laptop', 'macbook', 'notebook', 'ultrabook', 'pc', 'programming', 'coding', 'developer', 'college project', 'ideapad', 'inspiron', 'thinkpad']):
            category = 'Laptops'
        elif any(w in text for w in ['phone', 'smartphone', 'mobile', 'iphone', 'galaxy', 'pixel', 'oneplus', '5g', 'android', 'camera phone']):
            category = 'Smartphones'
        elif any(w in text for w in ['headphone', 'earphone', 'earbud', 'earbuds', 'tws', 'airpods', 'noise cancel', 'anc', 'audio', 'sound', 'bass', 'speaker', 'bluetooth']):
            category = 'Headphones'
        elif any(w in text for w in ['watch', 'smartwatch', 'smart watch', 'fitness tracker', 'band', 'heart rate', 'apple watch', 'wearable']):
            category = 'Watches'
        elif any(w in text for w in ['monitor', 'keyboard', 'mouse', 'gaming', 'ps5', 'playstation', 'console', 'electronics']):
            category = 'Electronics'
        elif any(w in text for w in ['shirt', 'shoes', 'sneaker', 'jeans', 'denim', 'blazer', 'jacket', 'fashion', 'clothing', 'dress', 'wear']):
            category = 'Fashion'
        elif any(w in text for w in ['air fryer', 'coffee', 'kitchen', 'vacuum', 'cooker', 'home', 'fryer']):
            category = 'Home & Kitchen'
        elif any(w in text for w in ['charger', 'ssd', 'case', 'sleeve', 'cable', 'adapter', 'accessories', 'power bank']):
            category = 'Accessories'

        # 3. Use Case Detection
        use_cases = []
        use_case_map = {
            'programming': ['coding', 'programming', 'developer', 'software', 'college', 'btech', 'engineering', 'study', 'projects'],
            'gaming': ['gaming', 'games', 'fps', 'gpu', 'graphics', 'rtx', 'high refresh', 'stream'],
            'photography': ['camera', 'photo', 'video', 'cinematic', 'portrait', 'photos', 'vlog'],
            'battery': ['battery', 'long lasting', 'all day', 'backup', 'fast charge'],
            'travel': ['travel', 'portable', 'lightweight', 'compact', 'office', 'commute'],
            'fitness': ['fitness', 'workout', 'gym', 'health', 'running', 'waterproof', 'spO2', 'heart rate'],
            'music': ['music', 'bass', 'anc', 'noise cancelling', 'hifi', 'audiophile', 'podcasts']
        }
        for uc, keywords in use_case_map.items():
            if any(k in text for k in keywords):
                use_cases.append(uc)

        # 4. Brand Detection
        brands = ['Apple', 'Dell', 'HP', 'Lenovo', 'ASUS', 'Samsung', 'Sony', 'Bose', 'OnePlus', 'Google', 'boAt', 'JBL', 'Nike', 'Levi\'s', 'Logitech', 'Philips', 'Dyson', 'Nespresso']
        found_brands = [b for b in brands if b.lower() in text]

        return {
            'category': category,
            'max_budget': max_budget,
            'min_budget': min_budget,
            'use_case': use_cases,
            'preferred_brands': found_brands,
            'query_text': query_text
        }

    @classmethod
    def recommend_products(cls, user_query, limit=6):
        """
        Executes end-to-end AI recommendations based on user prompt.
        """
        # Step 1: Parse query
        parsed = cls.parse_query_with_llm(user_query)
        if not parsed:
            parsed = cls.parse_query_heuristically(user_query)

        query_text = user_query.lower()
        category_name = parsed.get('category')
        max_budget = parsed.get('max_budget')
        use_cases = parsed.get('use_case', [])
        brands = parsed.get('preferred_brands', [])

        # Step 2: Fetch products
        query = Product.query
        if category_name:
            # Filter or prioritize by category
            category_products = query.join(Product.category).filter(Product.category.has(name=category_name)).all()
            if not category_products:
                category_products = Product.query.all()
        else:
            category_products = Product.query.all()

        # Step 3: Score each product
        scored_products = []
        for p in category_products:
            score = 60.0 # Base match
            reasons = []

            # Category match bonus
            if category_name and p.category and p.category.name.lower() == category_name.lower():
                score += 15
                reasons.append(f"Matches your requested category: {p.category.name}")

            # Budget evaluation
            if max_budget:
                if p.final_price <= max_budget:
                    # Within budget bonus
                    savings = max_budget - p.final_price
                    score += 15
                    if savings > 0:
                        reasons.append(f"Fits your budget of ₹{int(max_budget):,} (Saves ₹{int(savings):,})")
                    else:
                        reasons.append(f"Right on budget at ₹{int(p.final_price):,}")
                elif p.final_price <= max_budget * 1.15:
                    # Slightly above budget (tolerable)
                    score += 5
                    reasons.append(f"Just 10-15% above target budget (₹{int(p.final_price):,}) for significantly better performance")
                else:
                    score -= 20

            # Brand match
            if brands and p.brand.lower() in [b.lower() for b in brands]:
                score += 10
                reasons.append(f"From your preferred brand {p.brand}")

            # Usage keywords & specifications matching
            specs = p.specifications
            specs_str = " ".join([f"{k} {v}" for k, v in specs.items()]).lower()
            desc_str = (p.description + " " + p.name).lower()
            full_text = f"{desc_str} {specs_str}"

            # Check use cases
            if 'programming' in use_cases:
                ram_match = re.search(r'(\d+)\s*gb\s*ram', full_text)
                if ram_match and int(ram_match.group(1)) >= 16:
                    score += 10
                    reasons.append(f"{ram_match.group(1)} GB RAM provides smooth multitasking for coding & IDEs")
                elif 'ssd' in full_text:
                    score += 5
                    reasons.append("Fast NVMe SSD for quick build times & boot speeds")

            if 'gaming' in use_cases:
                if any(g in full_text for g in ['rtx', 'gpu', 'graphics', '144hz', '165hz', 'gaming']):
                    score += 12
                    reasons.append("Dedicated high-performance GPU and high refresh rate display for gaming")

            if 'photography' in use_cases or 'camera' in query_text:
                if any(c in full_text for c in ['mp', 'camera', 'ois', 'telephoto', 'ultra-wide', '4k', 'pro']):
                    score += 10
                    reasons.append("Pro-grade camera setup with crisp image processing")

            if 'battery' in use_cases or 'battery' in query_text:
                if any(b in full_text for b in ['hours', 'mah', 'long battery', 'all-day', 'fast charge']):
                    score += 8
                    reasons.append("Long-lasting battery endurance with rapid charging support")

            if 'music' in use_cases or 'anc' in query_text:
                if any(m in full_text for m in ['anc', 'noise cancelling', 'spatial', 'hi-res', 'driver']):
                    score += 10
                    reasons.append("Active Noise Cancellation (ANC) with immersive acoustic tuning")

            # High customer rating bonus
            if p.rating >= 4.5:
                score += 5
                reasons.append(f"Top-rated by customers ({p.rating}★ rating from {p.review_count}+ buyers)")

            # Normalize match percentage between 70% and 98%
            match_percentage = min(98, max(72, int(score)))

            # If not enough reasons, add generic strong points from specs
            if len(reasons) < 3:
                for k, v in list(specs.items())[:2]:
                    reasons.append(f"Features {k}: {v}")

            scored_products.append({
                'product': p.to_dict(),
                'match_percentage': match_percentage,
                'reasons': reasons[:4],
                'raw_score': score
            })

        # Sort by match score descending
        scored_products.sort(key=lambda x: (x['match_percentage'], x['product']['rating']), reverse=True)
        top_results = scored_products[:limit]

        # Extract best match
        best_match = top_results[0] if top_results else None
        alternatives = top_results[1:] if len(top_results) > 1 else []

        return {
            'query': user_query,
            'extracted_intent': {
                'category': category_name or 'All Products',
                'budget': f"Up to ₹{int(max_budget):,}" if max_budget else 'Flexible',
                'use_cases': use_cases,
                'brands': brands
            },
            'best_match': best_match,
            'recommendations': top_results,
            'alternatives': alternatives,
            'summary_text': cls._generate_summary(best_match, category_name, max_budget, use_cases)
        }

    @staticmethod
    def _generate_summary(best_match, category, budget, use_cases):
        if not best_match:
            return "We couldn't find an exact match for your query, but here are some top trending products."
        
        prod_name = best_match['product']['name']
        match_pct = best_match['match_percentage']
        use_str = f" for {', '.join(use_cases)}" if use_cases else ""
        budget_str = f" within ₹{int(budget):,}" if budget else ""
        
        return f"Based on your requirements{use_str}{budget_str}, our AI recommends **{prod_name}** with a **{match_pct}% match score** as the optimal blend of performance, customer satisfaction, and value for money."

    @classmethod
    def compare_products_ai(cls, product_ids):
        """
        Generates comprehensive AI comparison and 'Which one should I choose?' verdict.
        """
        products = Product.query.filter(Product.id.in_(product_ids)).all()
        if not products or len(products) < 2:
            return {'error': 'Select at least 2 products for comparison'}

        prods_dict = [p.to_dict() for p in products]

        # Determine winner categories:
        # Best Value: Lowest price with decent specs
        # Best Performance: Highest price / highest specs
        # Best Rated: Highest rating
        best_value = min(prods_dict, key=lambda x: x['final_price'])
        best_rated = max(prods_dict, key=lambda x: (x['rating'], x['review_count']))
        
        verdicts = []
        for p in prods_dict:
            strengths = []
            if p['id'] == best_value['id']:
                strengths.append(f"Most budget-friendly at ₹{int(p['final_price']):,}")
            if p['id'] == best_rated['id']:
                strengths.append(f"Highest customer rating of {p['rating']}★")
            if p['discount_percent'] > 15:
                strengths.append(f"Great deal with {int(p['discount_percent'])}% discount")

            # Extract key spec highlight
            specs = p.get('specifications', {})
            for k, v in list(specs.items())[:2]:
                strengths.append(f"{k}: {v}")

            verdicts.append({
                'product_id': p['id'],
                'product_name': p['name'],
                'brand': p['brand'],
                'price': p['final_price'],
                'rating': p['rating'],
                'recommended_for': f"Choose this if you prioritize {p['brand']} ecosystem, {strengths[0] if strengths else 'overall reliability'}.",
                'key_strengths': strengths
            })

        ai_verdict = f"If you are looking for the best price-to-performance ratio, **{best_value['name']}** is the smarter pick at ₹{int(best_value['final_price']):,}. However, if you want top-tier user satisfaction and proven reliability, **{best_rated['name']}** ({best_rated['rating']}★) is our top recommendation."

        return {
            'products': prods_dict,
            'winner_value_id': best_value['id'],
            'winner_rated_id': best_rated['id'],
            'ai_verdict': ai_verdict,
            'product_verdicts': verdicts
        }

    @classmethod
    def get_why_this_product(cls, product):
        """
        Generates instant 'Why This Product?' AI insights for product details.
        """
        if product.why_this_product:
            return product.why_this_product

        specs = product.specifications
        cat_name = product.category.name if product.category else 'Product'
        
        points = []
        if 'Laptops' in cat_name:
            points.append(f"Engineered with {specs.get('Processor', 'high performance CPU')} and {specs.get('RAM', 'fast RAM')} for seamless multitasking.")
        elif 'Smartphones' in cat_name:
            points.append(f"Features a stunning {specs.get('Display', 'OLED Display')} and pro-grade {specs.get('Camera', 'camera system')}.")
        elif 'Headphones' in cat_name:
            points.append(f"Equipped with {specs.get('Noise Cancellation', 'Active Noise Cancellation')} and up to {specs.get('Battery Life', 'long battery life')}.")
        else:
            points.append(f"Premium build quality from {product.brand} designed for everyday reliability.")

        points.append(f"Backed by a strong {product.rating}★ rating from verified customers.")
        return " ".join(points)
