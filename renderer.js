let buttons = false

document.getElementById("min-btn").addEventListener("click", function (e) {
     window.electronAPI.changeWindow("min")
});

document.getElementById("max-btn").addEventListener("click", function (e) {
     window.electronAPI.changeWindow("max")
});

document.getElementById("close-btn").addEventListener("click", function (e) {
     window.electronAPI.changeWindow("close")
});

document.getElementById("home-btn").addEventListener("click", function (e) {
     document.getElementById("display-title").innerHTML = e.srcElement.classList[1]
     document.getElementById("home-page").style.opacity = 1
     document.getElementById("calendar-page").style.opacity = 0
})

document.getElementById("calendar-btn").addEventListener("click", function (e) {
     document.getElementById("display-title").innerHTML = e.srcElement.classList[1]
     document.getElementById("home-page").style.opacity = 0
     document.getElementById("calendar-page").style.opacity = 1
})

document.getElementById("account-btn").addEventListener("click", function (e) {
     document.getElementById("display-title").innerHTML = e.srcElement.classList[1]
     document.getElementById("home-page").style.opacity = 0
})

document.getElementById("profiles-btn").addEventListener("click", function (e) {
     document.getElementById("display-title").innerHTML = e.srcElement.classList[1]
     document.getElementById("home-page").style.opacity = 0
})

function doDate() {
     var date = new Date();
     document.getElementById("date").innerHTML = `${date.getHours() < 10 ? "0" + date.getHours() : date.getHours()}:${date.getMinutes() < 10 ? "0" + date.getMinutes() : date.getMinutes()}:${date.getSeconds() < 10 ? "0" + date.getSeconds() : date.getSeconds()}`;
}

async function fetchAsync(url) {
     let response = await fetch(url, {
          method: 'GET',
          credentials: 'omit'
     });
     let data = await response.json();
     return data;
}

function sortSizes(skus, available) {
     if (available == undefined || skus == undefined) {
          return {};
     }

     return skus.reduce((sizes, size) => {
          available.forEach(inSize => {
               if (inSize.id == size.id && inSize.level !== "OOS") {
                    sizes[`${size.countrySpecifications[0].localizedSizePrefix} ${size.countrySpecifications[0].localizedSize}`] = inSize.level
                    sizes["inStock"] = inSize.available
               }
          })

          return sizes;
     }, {})
}

function sortDate(date) {
     const months = [
          "January",
          "February",
          "March",
          "April",
          "May",
          "June",
          "July",
          "August",
          "September",
          "October",
          "November",
          "December"
     ]

     let num = Number(date.substring(6,8))

     let suffix = "th";
     if (num == 0) suffix = "";
     if (num % 10 == 1 && num % 100 != 11) suffix = "st";
     if (num % 10 == 2 && num % 100 != 12) suffix = "nd";
     if (num % 10 == 3 && num % 100 != 13) suffix = "rd";

     return `${num}${suffix} ${months[Number(date.substring(4,6))]} ${Number(date.substring(0,4))}`;
}

function getNike(endpoint) {
     const toGet = `https://api.nike.com${endpoint}`
     fetchAsync(toGet).then(data => {
          const nextPage = data.pages.next
          const items = data.objects
          items.forEach(item => {
               if (item.productInfo) {
                    let channels = ""
                    item.productInfo[0].merchProduct.channels.forEach(store => {
                         item.productInfo[0].merchProduct.channels[item.productInfo[0].merchProduct.channels.length - 1] == store ? channels += `${store}` : channels += `${store} • `
                    })
                    const sizeData = sortSizes(item.productInfo[0].skus, item.productInfo[0].availableSkus)
                    const available = sizeData.inStock ^ false
                    if (available && item.productInfo[0].merchProduct.status == "ACTIVE") {
                         let item_element = document.getElementsByClassName("itemDisplay")[0].cloneNode(true)

                         item_element.setAttribute('id', item.productInfo[0].merchProduct.styleColor);

                         item_element.getElementsByClassName('itemName')[0].innerHTML = item.productInfo[0].productContent.fullTitle
                         item_element.getElementsByClassName('styleCode')[0].innerHTML = `Style Code: ${item.productInfo[0].merchProduct.styleColor}`
                         item_element.getElementsByClassName('releaseDate')[0].innerHTML = sortDate(item.productInfo[0].merchProduct.commerceStartDate.substring(0, 10).replaceAll('-', ''))
                         item_element.getElementsByClassName('thumbnail')[0].src = item.productInfo[0].imageUrls.productImageUrl

                         item_element.getElementsByClassName('web-btn')[0].setAttribute('data-link', `https://www.nike.com/gb/launch/t/${item.productInfo[0].productContent.slug}`)

                         item_element.setAttribute('style', "visibility: visible;")

                         item_element.getElementsByClassName('web-btn')[0].addEventListener("click", function (e) {
                              const link = e.composedPath()[0].attributes["data-link"].nodeValue
                              window.electronAPI.goto(link)
                         })

                         document.getElementsByClassName("itemDisplay")[0].after(item_element)
                    }

                    if (document.getElementById("test-btn")) {
                         document.getElementById("test-btn").remove()
                    }
               }
          })
          if (nextPage) {
               getNike(nextPage)
          }
     })

}

getNike('/product_feed/threads/v2/?anchor=0&count=100&filter=marketplace%28GB%29&filter=language%28en-GB%29&filter=channelId%28010794e5-35fe-4e32-aaff-cd2c74f89d61%29&filter=exclusiveAccess%28true%2Cfalse%29&fields=active%2Cid%2ClastFetchTime%2CproductInfo%2CpublishedContent.nodes%2CpublishedContent.subType%2CpublishedContent.properties.coverCard%2CpublishedContent.properties.productCard%2CpublishedContent.properties.products%2CpublishedContent.properties.publish.collections%2CpublishedContent.properties.relatedThreads%2CpublishedContent.properties.seo%2CpublishedContent.properties.threadType%2CpublishedContent.properties.custom%2CpublishedContent.properties.title')

setInterval(doDate, 1000);