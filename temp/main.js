google.charts.load('current', { 'packages': ['corechart'], 'language': 'ru' });
google.charts.setOnLoadCallback(drawChart);

function drawChart() {

    var ddd = [
        ['Дата', 'Улица', 'T6', 'T8'],

    ];
    data.forEach(function(x) {
        ddd.push([new Date((x[0] * 1000) - (60000 * 60 * 3)), x[5], x[4], x[6]])
    })
    var gdata = google.visualization.arrayToDataTable(ddd);
    var options = {

        curveType: 'function',
        height: 600,
        vAxis: {
            title: 'Температура (°C)'
        },
        hAxis: {
            title: 'Дата время'
        },

        legend: { position: 'bottom' }
    };

    var chart = new google.visualization.LineChart(document.getElementById('chart_div'));

    chart.draw(gdata, options);






    var ddd = [
        ['Дата', 'Температура устройство', 'Температура улица'],

    ];
    d2.forEach(function(x) {
        ddd.push([new Date((x[0] * 1000)), x[1], x[3]])
    })
    var gdata = google.visualization.arrayToDataTable(ddd);
    var options = {
        title: 'Температура за весь поход',
        curveType: 'function',
        height: 600,
        vAxis: {
            title: 'Температура (°C)'
        },
        hAxis: {
            title: 'Дата время'
        },

        legend: { position: 'bottom' }
    };

    var chart = new google.visualization.LineChart(document.getElementById('chart_div2'));

    chart.draw(gdata, options);




    var ddd = [
        ['Дата', 'Давление'],

    ];
    d2.forEach(function(x) {
        ddd.push([new Date((x[0] * 1000)), x[2]])
    })
    var gdata = google.visualization.arrayToDataTable(ddd);
    var options = {
        title: 'Атмосферное давление за поход',
        curveType: 'function',
        height: 600,
        vAxis: {
            title: 'Давление (гПа)'
        },
        hAxis: {
            title: 'Дата время'
        },

        legend: { position: 'bottom' }
    };

    var chart = new google.visualization.LineChart(document.getElementById('chart_div3'));

    chart.draw(gdata, options);


}