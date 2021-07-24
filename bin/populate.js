#!/bin/env node

require('dotenv').config();
import fetch from 'node-fetch';

async function upvotocracy() {
  const recent = 'https://briskreader.com/api/1/recent';
  const res = await fetch(recent);
  const data = await res.json();

  for (let item of data) {
    console.log(item.shortId);
		const hashtags = item.summary.topics;

    const res2 = await fetch('https://upvotocracy.com/api/1/posts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + process.env.AUTH_UPVOTOCRACY,
      },
      body: JSON.stringify({
        category: process.env.UPVOTOCRACY_CAT_NEWS,
        type: 'link',
        url: 'https://briskreader.com/link/' + item.shortId,
        hashtags,
        title: item.title,
        thumb: item.meta.thumb,
      }),
    });
    const data2 = await res2.json();
    console.log(data2);
  }
}

async function bitcoinlatte() {
	const cryptos = [{
		tag: 'BTC',
		cat: process.env.BITCOINLATTE_CAT_BTC
	},{
		tag: 'ETH',
		cat: process.env.BITCOINLATTE_CAT_ETH
	},{
		tag: 'SHIB',
		cat: process.env.BITCOINLATTE_CAT_SHIB
	}];

	const topics = [{
		tag: 'cbdc',
		cat: process.env.BITCOINLATTE_CAT_CBDC
	}, {
		tag: 'defi',
		cat: process.env.BITCOINLATTE_CAT_DEFI
	}];

	for (let tag of cryptos) {
		const url = 'https://briskreader.com/api/1/cryptos/'+tag.tag;
		const res = await fetch(url);
		const data = await res.json();

		for (let item of data) {
			console.log(item.shortId);
			const hashtags = item.summary.topics;

			const res2 = await fetch('https://bitcoinlatte.com/api/1/posts', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: 'Bearer ' + process.env.AUTH_BITCOINLATTE,
				},
				body: JSON.stringify({
					category: tag.cat,
					type: 'link',
					url: 'https://briskreader.com/link/' + item.shortId,
					hashtags,
					title: item.title,
					thumb: item.meta.thumb,
				}),
			});
			const data2 = await res2.json();
			console.log(data2);
		}
	}

	for (let tag of topics) {
		const url = 'https://briskreader.com/api/1/topics/'+tag.tag;
		const res = await fetch(url);
		const data = await res.json();

		for (let item of data) {
			console.log(item.shortId);
			const hashtags = item.summary.topics;

			const res2 = await fetch('https://bitcoinlatte.com/api/1/posts', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: 'Bearer ' + process.env.AUTH_BITCOINLATTE,
				},
				body: JSON.stringify({
					category: tag.cat,
					type: 'link',
					url: 'https://briskreader.com/link/' + item.shortId,
					hashtags,
					title: item.title,
					thumb: item.meta.thumb,
				}),
			});
			const data2 = await res2.json();
			console.log(data2);
		}
	}
}

bitcoinlatte()
upvotocracy()
