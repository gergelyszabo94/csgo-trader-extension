chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        if (request.type == "updatecurency") {
            var currencyid = parseInt(request.currencyid);
            var actualCode = ['ExternalPrices.UpdatePrice(' + currencyid + ');'].join('\r\n');
            var script = document.createElement('script');
            script.textContent = actualCode;
            (document.head || document.documentElement).appendChild(script);
            script.parentNode.removeChild(script);
        }

        if (request.type == "changeextcolor") {
            modStyle(request.colors);
        }

        if (request.type == "changesimplify") {
            if (request.simplify) {
                $('body').addClass('simple');
            } else {
                $('body').removeClass('simple');
            }
        }
    });

(function () {
    var styleEl = document.createElement('style');
    document.body.appendChild(styleEl);
    window.modStyle = function (styles) {
        var str = '';
        if (styles.extbgcolor) {
            var bgcolor = hexToRgb(styles.extbgcolor);
            str += 'body .p-price {' +
                'background-color: rgba(' + bgcolor.r + ',' + bgcolor.g + ',' + bgcolor.b + ',0.6);' +
                'color: ' + styles.exttextcolor + ';}';
        }
        styleEl.innerHTML = str;
    }
}());

function hexToRgb(hex) {
    // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
    var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    hex = hex.replace(shorthandRegex, function (m, r, g, b) {
        return r + r + g + g + b + b;
    });

    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}