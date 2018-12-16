$(function () {
    DisplayGraph();
});

$('#bt_Start').click(function () {
    StartGettingHistory();
    return false;
});

$('#bt_Clear').click(function () {
    if (!confirm('Are you sure?')) {
        return false;
    }

    if (timer) {
        clearTimeout(timer);
    }
    chrome.storage.local.set({
        totalminus: 0,
        totalplus: 0,
        lastIdx: 0,
        totalRows: 0,
        graphdata: []
    });
    return false;
});

$('#bt_Show').click(function () {
    ShowTable();
    $('#bt_Hide').show();
    return false;
});

$('#bt_Hide').click(function () {
    HideTable();
    $('#bt_Hide').hide();
    return false;
});

$('#bt_Fix').click(function () {
    FixData();
    return false;
});

$('#bt_Alltime').click(function () {
    drawdays = -1;
    DisplayGraph();
    $('#div_period a').removeClass('active');
    $(this).addClass('active');
    return false;
});

$('#bt_thisyear').click(function () {
    drawdays = 0;
    DisplayGraph();
    $('#div_period a').removeClass('active');
    $(this).addClass('active');
    return false;
});

$('#bt_30days').click(function () {
    drawdays = 30;
    DisplayGraph();
    $('#div_period a').removeClass('active');
    $(this).addClass('active');
    return false;
});

$('#bt_7days').click(function () {
    drawdays = 7;
    DisplayGraph();
    $('#div_period a').removeClass('active');
    $(this).addClass('active');
    return false;
});

$('#cbChartType').change(function () {
    DisplayGraph();
});

var fakeYear = 0;
var lastDate = null;
var drawdays = -1;
var monthName = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
var today = new Date();

var getDate = function (date) {
    var parts = date.split(' ');
    var day = parseInt(parts[0]);
    var month = monthName.indexOf(parts[1]);

    if (isNaN(day)) {
        day = parseInt(parts[1]);
        month = monthName.indexOf(parts[0]);
    }

    var rs = Date.UTC(fakeYear, month, day);
    if (rs > today || (lastDate && lastDate < rs)) {
        fakeYear--;
        rs = Date.UTC(fakeYear, month, day);
    }
    lastDate = rs;
    return rs;
};

const TWENTYFOUR_HOURS_IN_MILLISECONDS = 86400000;
var drawChart = function (data, subtext) {
    var categories = [], sold = [], buy = [], soldacc = [], buyacc = [], profitacc = [];
    fakeYear = new Date().getFullYear();
    lastDate = null;
    var startidx = 0;
    var accm = 0, accp = 0;

    for (var i = data.length - 1; i >= 0; i--) {
        var item = data[i];
        var date = getDate(item.date);
        item.fulldate = date;
    }

    let startDate = 0;
    let endDate = new Date(new Date(Date.now() + TWENTYFOUR_HOURS_IN_MILLISECONDS).toDateString()).getTime();

    if (drawdays > 0 && data.length) {
        startDate = endDate - drawdays * TWENTYFOUR_HOURS_IN_MILLISECONDS;
    } else if (drawdays == 0) {
        startDate = new Date(new Date().getFullYear(), 0, 1).getTime();
    }

    const filteredData = data.filter(item => ((item.fulldate >= startDate) && (item.fulldate < endDate)));

    for (var j = 0; j < filteredData.length; j++) {
        var item = filteredData[j];
        accm += item.totalm;
        accp -= item.totalp;

        item.accm = accm;
        item.accp = accp;

        sold.push({x: item.fulldate, y: item.totalm / 100, count: item.countm});
        buy.push({x: item.fulldate, y: item.totalp / 100, count: item.countp});

        soldacc.push({x: item.fulldate, y: item.accm / 100, count: item.countm});
        buyacc.push({x: item.fulldate, y: item.accp / 100, count: item.countp});
        profitacc.push({x: item.fulldate, y: (item.accm + item.accp) / 100, count: item.countm + item.countp});
    }

    if (!sold.length && !buy.length) {
        // start period
        sold.push({ x: startDate, y: 0, count: 0 });
        buy.push({ x: startDate, y: 0, count: 0 });
        soldacc.push({ x: startDate, y: 0, count: 0 });
        buyacc.push({ x: startDate, y: 0, count: 0 });
        profitacc.push({ x: startDate, y: 0, count: 0 });

        // end period
        sold.push({ x: endDate, y: 0, count: 0 });
        buy.push({ x: endDate, y: 0, count: 0 });
        soldacc.push({ x: endDate, y: 0, count: 0 });
        buyacc.push({ x: endDate, y: 0, count: 0 });
        profitacc.push({ x: endDate, y: 0, count: 0 });
    }

    //sold = sold.reverse();
    //buy = buy.reverse();

    //soldacc = soldacc.reverse();
    //buyacc = buyacc.reverse();
    //profitacc = profitacc.reverse();

    var chartType = $('#cbChartType').val();
    var isStep = (chartType == 'step');

    $('#divChart').highcharts({
        chart: {
            zoomType: 'x',
            type: isStep ? null : chartType,
            resetZoomButton: {
                position: {
                    // align: 'right', // by default
                    // verticalAlign: 'top', // by default
                    x: -120,
                    y: -30
                }
            }
        },
        title: {
            text: 'Steam community market graph',
            x: -20 //center
        },
        subtitle: {
            text: subtext,
            x: -20
        },
        xAxis: {
            labels: {
                rotation: 45,
                y: 30
            },
            type: 'datetime',
            minTickInterval: 24 * 3600 * 1000
        },
        yAxis: {
            title: {
                text: 'Total'
            },
            plotLines: [{
                value: 0,
                width: 1,
                color: '#808080'
            }]
        },
        legend: {
            layout: 'vertical',
            align: 'right',
            verticalAlign: 'top',
            shadow: '#000',
            floating: true
        },
        tooltip: {
            crosshairs: true,
            shared: true,
            formatter: function () {
                var rs = '<strong>' + new Date(this.x).toDateString() + '</strong>';
                var points = this.points;
                var total = 0, totalcount = 0;
                for (var i = 0; i < points.length; i++) {
                    var point = points[i].point;
                    rs += '<br /><span style="color:' + point.series.color + '">' + point.series.name + '</span>: ' + point.y + ' (' + point.options.count + ')';
                    if (point.series.name === 'Bought' || point.series.name === 'Sold') {
                        const delimiter = point.series.name === 'Bought' ? -1 : 1;
                        total += delimiter * point.y;
                        totalcount += point.options.count;
                    }
                }
                if (total != 0) {
                    rs += '<br /><span style="color:' + (total < 0 ? 'red' : 'blue') + '">Profit</span>: ' + total.toFixed(2) + ' (' + totalcount + ')';
                }

                return rs;
            }
        },
        plotOptions: {
            spline: {
                lineWidth: 2,
                states: {
                    hover: {
                        lineWidth: 3
                    }
                },
                marker: {
                    enabled: false
                }
            },
            line: {
                marker: {
                    enabled: !isStep
                }
            }
        },
        series: [{
            step: isStep,
            name: 'Sold',
            data: sold
        }, {
            step: isStep,
            name: 'Bought',
            data: buy
        }, {
            step: isStep,
            name: 'Acc. sold',
            data: soldacc,
            visible: false
        }, {
            step: isStep,
            name: 'Acc. bought',
            data: buyacc,
            visible: false
        }, {
            step: isStep,
            name: 'Acc. profit',
            data: profitacc,
            visible: false
        }]
    });
};

var DisplayGraph = function () {
    chrome.storage.local.get({
        totalminus: 0,
        totalplus: 0,
        lastIdx: 0,
        totalRows: 0,
        graphdata: []
    }, function (items) {
        var strRes = 'Total scanned: ' + (items.lastIdx) + '/' + items.totalRows + ' - Sold: ' + items.totalminus + ' - Bought: ' + items.totalplus + ' - Profit: ' + (Math.round((items.totalminus - items.totalplus) * 100) / 100);
        drawChart(items.graphdata, strRes);
    });
};

/*---------------------------------------------------------------------*/

var numOfRowGet = 20, tmdelay = 2000;
var isRunning = false;
var timer = null;
var regHis = /<div class="market_listing_left_cell market_listing_gainorloss">\s+?([\+\-])\s+?<\/div>[\s\S]+?<span class="market_listing_price">([\s\S]+?)<\/span>[\s\S]+?<div class="market_listing_right_cell market_listing_listed_date can_combine">([\s\S]+?)<\/div>[\s\S]+?<div class="market_listing_right_cell market_listing_listed_date can_combine">([\s\S]+?)<\/div>/gmi;
//var regHis = /<div class="market_listing_left_cell market_listing_gainorloss">\s+?([\+\-])\s+?<\/div>[\s\S]+?<span class="market_listing_price">([\s\S]+?)<\/span>[\s\S]+?<div class="market_listing_right_cell market_listing_listed_date">([\s\S]+?)<\/div>[\s\S]+?<div class="market_listing_right_cell market_listing_listed_date">([\s\S]+?)<\/div>/gmi;

var joinData = function (arr, idx1, idx2) {
    var it1 = arr[idx1], it2 = arr[idx2];
    it1.countm += it2.countm;
    it1.countp += it2.countp;
    it1.totalm += it2.totalm;
    it1.totalp += it2.totalp;
    arr[idx1] = it1;
    arr.splice(idx2, 1);
};

var FixData = function () {
    chrome.storage.local.get({
        totalminus: 0,
        totalplus: 0,
        lastIdx: 0,
        totalRows: 0,
        graphdata: []
    }, function (items) {
        var strRes = 'Total scanned: ' + (items.lastIdx) + '/' + items.totalRows + ' - Sold: ' + items.totalminus + ' - Bought: ' + items.totalplus + ' - Profit: ' + (Math.round((items.totalminus - items.totalplus) * 100) / 100);
        var ngraph = items.graphdata;

        for (var i = 0; i < ngraph.length; i++) {
            for (var j = i + 1; j < ngraph.length && j < i + 3; j++) {
                if (ngraph[i].date == ngraph[j].date) {
                    joinData(ngraph, i, j);
                }
            }
        }

        chrome.storage.local.set({
            graphdata: ngraph
        }, function () {

        });

        drawChart(ngraph, strRes);
        //$('#spanGraphData').html(strRes);
    });
};

var ShowTable = function () {
    chrome.storage.local.get({
        totalminus: 0,
        totalplus: 0,
        lastIdx: 0,
        totalRows: 0,
        graphdata: []
    }, function (items) {
        var strRes = 'Total scanned: ' + (items.lastIdx) + '/' + items.totalRows + ' - Sold: ' + items.totalminus + ' - Bought: ' + items.totalplus + ' - Profit: ' + (Math.round((items.totalminus - items.totalplus) * 100) / 100);
        var ngraph = items.graphdata;
        strRes += '<table border="1" class="table"><thead><tr><th>Date</th><th colspan="2">Sold</th><th>Acc. sold</th><th colspan="2">Bought</th><th>Acc. bought</th><th>Profit</th><th>Acc. profit</th></tr></thead><tbody>';
        var accm = 0, accp = 0;

        for (var i = 0; i < ngraph.length; i++) {
            accm += ngraph[i].totalm;
            accp += ngraph[i].totalp;

            strRes += '<tr><td>' + ngraph[i].date + '</td><td>' + (ngraph[i].totalm / 100) + '</td><td>' + ngraph[i].countm + '</td><td>' + (accm / 100)
                + '</td><td>' + (ngraph[i].totalp / 100) + '</td><td>' + ngraph[i].countp + '</td><td>' + (accp / 100)
                + '</td><td>' + ((ngraph[i].totalm - ngraph[i].totalp) / 100).toFixed(2) + '</td><td>' + ((accm - accp) / 100).toFixed(2)
                + '</td></tr>';
        }
        strRes += '</tbody></table>';
        $('#spanGraphData').html(strRes);

    });
};

var HideTable = function () {
    $('#spanGraphData').html('');
};

var StartGettingHistory = function () {
    if (isRunning) {
        return;
    }
    if (timer) {
        clearTimeout(timer);
    }
    chrome.storage.local.get({
        lastIdx: 0
    }, function (items) {
        isRunning = true;
        GetPriceHistory(items.lastIdx);
    });
};

var ProcessPriceData = function (res) {
    if (!res.total_count) {
        console.log('steam error');
        numOfRowGet = 10;
        timer = setTimeout(function () {
            StartGettingHistory();
        }, tmdelay * 2);
        return;
    }
    var m;
    var htmlres = res.results_html;
    chrome.storage.local.get({
        totalminus: 0,
        totalplus: 0,
        graphdata: []
    }, function (items) {
        var totalMinus = 0, totalPlus = 0, graphData = [];
        items.graphdata;
        while (m = regHis.exec(htmlres)) {
            var sign = m[1].trim(), price = m[2].trim(), date = m[3].trim();
            if (graphData.length == 0 || graphData[graphData.length - 1].date !== date) {
                graphData.push({date: date, totalp: 0, totalm: 0, countp: 0, countm: 0});
            }

            var pp = /([\d\.,]+)/.exec(price.replace(/\&#.+?;/g, '').replace('--', '00').replace(' p&#1091;&#1073;.', '').replace(/\s/, ''));

            if (pp) {
                pp = pp[1].replace(/,(\d\d)$/g, '.$1').replace(/.(\d\d\d)/g, '$1');
            } else {
                pp = 0;
            }
            pp = parseFloat(pp);
            if (sign === '-') {
                totalMinus += pp;
                graphData[graphData.length - 1].totalm += Math.round(pp * 100);
                graphData[graphData.length - 1].countm += 1;
            } else {
                totalPlus += pp;
                graphData[graphData.length - 1].totalp += Math.round(pp * 100);
                graphData[graphData.length - 1].countp += 1;
            }
        }
        graphData = graphData.reverse();
        var ngraph = null;
        if (items.graphdata.length == 0) {
            ngraph = graphData;
        } else {
            ngraph = items.graphdata;
            for (var ii = 0; ii < graphData.length; ii++) {
                if (ngraph[ngraph.length - 1].date === graphData[ii].date) {
                    ngraph[ngraph.length - 1].totalm += graphData[ii].totalm;
                    ngraph[ngraph.length - 1].totalp += graphData[ii].totalp;
                    ngraph[ngraph.length - 1].countm += graphData[ii].countm;
                    ngraph[ngraph.length - 1].countp += graphData[ii].countp;
                } else {
                    ngraph.push(graphData[ii]);
                }
            }
        }

        var nTotalM = Math.round((items.totalminus + totalMinus) * 100) / 100, nTotalP = Math.round((items.totalplus + totalPlus) * 100) / 100;

        chrome.storage.local.set({
            totalminus: nTotalM,
            totalplus: nTotalP,
            lastIdx: res.total_count - res.start,
            totalRows: res.total_count,
            graphdata: ngraph
        }, function () {
            DisplayGraph();
        });
        if (numOfRowGet < 100) {
            numOfRowGet += 10;
        }
        if (res.start > 0) {
            timer = setTimeout(function () {
                StartGettingHistory();
            }, tmdelay);
        }
    });
};

var GetPriceHistory = function (startIdx) {
    console.log('start get history', startIdx);
    if (typeof (startIdx) != 'undefined') {
        $.ajax({
            url: 'http://steamcommunity.com/market/myhistory/render/',
            data: {start: 0, count: 1, l: 'en'},
            success: function (sres) {
                if (sres.success) {
                    var start = sres.total_count - numOfRowGet - startIdx,
                        pcount = numOfRowGet;
                    if (start < 0) {
                        pcount = numOfRowGet + start;
                        start = 0;
                    }
                    if (pcount > 0) {
                        $.ajax({
                            url: 'http://steamcommunity.com/market/myhistory/render/',
                            data: {start: start, count: pcount, l: 'en'},
                            success: function (res) {
                                if (res.success) {
                                    ProcessPriceData(res);
                                }
                            },
                            error: function (res) {
                                console.log('error');
                                isRunning = false;
                                timer = setTimeout(function () {
                                    StartGettingHistory();
                                }, tmdelay * 2);
                            },
                            complete: function (res) {
                                isRunning = false;
                            }
                        });
                    }
                }
            },
            error: function (res) {
                console.log('error');
                isRunning = false;
                timer = setTimeout(function () {
                    StartGettingHistory();
                }, tmdelay * 2);
            }
        });
    }
};
