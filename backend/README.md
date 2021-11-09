# Backend
The extension's backend so solely consists of Python scripts that are run by AWS Lambda.

## exchangeRates 
Triggered by CloudWatch Scheduled events to run every 3 hours. 
It fetches currency exchange rates from `fixer.io`, cryptocurrency rates from `coincap.io`
and puts the unified result on S3. When done it invalidates the CloudFront cache. 

## priceScraper
### priceScraper
Triggered by CloudWatch Scheduled events to run every day at 1AM GMT.
It is responsible for fetching pricing information from pricing providers
(steamapis, cs.money, bitskins, loot.farm, csgo.tm), unifying the result and
creating csgotrader's own price.
It is described in more detail on the [pricing page](https://csgotrader.app/prices/).

### priceScraperRetry
Runs every hour and checks if priceScraper managed to get all the prices,
process them and upload them to S3.
If it didn't (the pricing file is over 24 hours old), it executes priceScraper.