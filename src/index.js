export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // APIアクセス
    if (url.pathname === "/api/search") {
      const keyword = url.searchParams.get("keyword");

      if (!keyword) {
        return Response.json({
          error: "検索キーワードを入力してください"
        }, {
          status: 400
        });
      }

try {
  if (!env.RAKUTEN_APPLICATION_ID) {
    return Response.json({
      error: "RAKUTEN_APPLICATION_ID が設定されていません"
    }, { status: 500 });
  }

  if (!env.RAKUTEN_ACCESS_KEY) {
    return Response.json({
      error: "RAKUTEN_ACCESS_KEY が設定されていません"
    }, { status: 500 });
  }

  let apiUrl =
    "https://openapi.rakuten.co.jp/ichibams/api/IchibaItem/Search/20220601" +
    "?applicationId=" + encodeURIComponent(env.RAKUTEN_APPLICATION_ID) +
    "&accessKey=" + encodeURIComponent(env.RAKUTEN_ACCESS_KEY) +
    "&keyword=" + encodeURIComponent(keyword) +
    "&hits=20";

  if (env.RAKUTEN_AFFILIATE_ID) {
    apiUrl +=
      "&affiliateId=" +
      encodeURIComponent(env.RAKUTEN_AFFILIATE_ID);
  }

  const response = await fetch(apiUrl);
  const data = await response.json();

  if (!response.ok) {
    return Response.json({
      error: "楽天APIエラー",
      status: response.status,
      details: data
    }, { status: response.status });
  }

  return Response.json(data, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Content-Type": "application/json"
    }
  });

} catch (error) {
  return Response.json({
    error: "楽天APIへの接続中にエラーが発生しました",
    details: error.message
  }, { status: 500 });
}

      } catch (error) {
        return Response.json({
          error: "楽天APIへの接続に失敗しました。",
          detail: error.message
        }, {
          status: 500
        });
      }
    }

    // HTML表示
    return new Response(`
<!DOCTYPE html>
<html lang="ja">
<head>
<meta charset="UTF-8">
<title>楽天ROOMおすすめ商品</title>
<style>
body {
  margin: 0;
  font-family: sans-serif;
  background: #f5f5f5;
}

header {
  background: #c40000;
  color: white;
  text-align: center;
  padding: 35px;
}

main {
  max-width: 1100px;
  margin: 30px auto;
}

.search-box {
  background: white;
  padding: 25px;
  border-radius: 15px;
}

input {
  width: 80%;
  padding: 15px;
  font-size: 18px;
}

button {
  padding: 15px 30px;
  background: #c40000;
  color: white;
  border: none;
  font-size: 18px;
  cursor: pointer;
}

#results {
  margin-top: 30px;
}

.item {
  background: white;
  margin-bottom: 15px;
  padding: 20px;
  border-radius: 10px;
}
</style>
</head>

<body>

<header>
<h1>楽天ROOMおすすめ商品</h1>
<p>楽天ROOMに紹介しているおすすめ商品</p>
</header>

<main>

<div class="search-box">
<h2>商品を検索</h2>

<input id="keyword" placeholder="例：スニーカー">
<button onclick="searchItems()">検索</button>

</div>

<div id="results"></div>

</main>

<script>

async function searchItems() {

  const keyword =
    document.getElementById("keyword").value;

  const results =
    document.getElementById("results");

  results.innerHTML = "検索中...";

  try {

    const response =
      await fetch(
        "/api/search?keyword=" +
        encodeURIComponent(keyword)
      );

    const data =
      await response.json();

    if (!data.Items) {
      results.innerHTML =
        "商品を取得できませんでした。<br>" +
        (data.error || "");
      return;
    }

    results.innerHTML = "";

    data.Items.forEach(itemData => {

      const item =
        itemData.Item;

      const div =
        document.createElement("div");

      div.className = "item";

      div.innerHTML = `
        <h3>${item.itemName}</h3>

        <p>
        ${item.itemPrice.toLocaleString()}円
        </p>

        <a href="${item.itemUrl}"
           target="_blank">
           商品ページを見る
        </a>
      `;

      results.appendChild(div);

    });

  } catch (error) {

    results.innerHTML =
      "楽天APIへの接続に失敗しました。";

  }

}

</script>

</body>
</html>
    `, {
      headers: {
        "content-type": "text/html;charset=UTF-8"
      }
    });
  }
};
