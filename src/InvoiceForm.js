import './InvoiceForm.css';
import React, { useState, useEffect } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import TimePickerModal from './TimePickerModal';
import './TimePickerModal.css';
import billFromListData from './data/bill_from_list.txt';
import name from './data/name.txt';
import venueFromListData from './data/venue_from_list.txt';
import { format } from 'date-fns';

const InvoiceForm = () => {
    const [invoiceNo, setInvoiceNo] = useState('');
    const [invoiceName, setInvoiceName] = useState('');
    const [price, setPrice] = useState('');
    const [administrativeFee] = useState('3%');
    const [totalPrice, setTotalPrice] = useState('');
    const [venue, setVenue] = useState('');
    const [monthNo, setMonthNo] = useState('');
    const [dayNo, setDayNo] = useState('');
    const [dayName, setDayName] = useState('');
    const [timeIn, setTimeIn] = useState('');
    const [timeOut, setTimeOut] = useState('');
    const [detail, setDetail] = useState('');
    const [isTimePickerOpen, setIsTimePickerOpen] = useState(false);
    const [billFromOptions, setBillFromOptions] = useState([]);
    const [venueFromOptions, setVenueFromOptions] = useState([]);
    const [textContent, setTextContent] = useState('');
    const [defaultDate, setDefaultDate] = useState('');
    const [defaultInvoiceDate, setDefaultInvoiceDate] = useState('');
    const [formattedInputDate, setFormattedInputDate] = useState('');
    const [dateInputValue, setDateInputValue] = useState('');
    const [invoiceDateInputValue, setInvoiceDateInputValue] = useState('');

    const [errors, setErrors] = useState({
        billFrom: '',
        invoiceNo: '',
        invoiceName: '',
        price: '',
        administrativeFee: '',
        totalPrice: '',
        venue: '',
        monthNo: '',
        dayNo: '',
        dayName: '',
        timeIn: '',
        timeOut: ''
    });

    useEffect(() => {
        const detailText = `${venue} ${monthNo}${dayNo} ${dayName} ${timeIn}-${timeOut}`;
        setDetail(detailText);
        fetchData(billFromListData, setBillFromOptions);
        fetchData(name, setTextContent);
        fetchData(venueFromListData, setVenueFromOptions);
    }, [venue, monthNo, dayNo, dayName, timeIn, timeOut]);

    useEffect(() => {
        const currentDate = new Date();
        currentDate.setDate(currentDate.getDate() + 1);
        const formattedDisplayDate = format(currentDate, 'MM/dd/yyyy');
        const formattedInputDate = format(currentDate, 'yyyy-MM-dd');

        setDefaultInvoiceDate(formattedDisplayDate);
        setFormattedInputDate(formattedInputDate);
        setInvoiceDateInputValue('');

        updateDefaultDate(formattedDisplayDate);
    }, []);

    const fetchData = (file, setState) => {
        fetch(file)
            .then(response => response.text())
            .then(data => {
                const options = data.split('\n').map(option => option.trim());
                options.unshift('');
                setState(options);
            })
            .catch(error => console.error(`Error loading options:`, error));
    };

    const handleCopyToClipboard = () => {
        const detailInput = document.getElementById('detail');
        detailInput.select();
        document.execCommand('copy');
        window.getSelection().removeAllRanges();
    };

    const getBase64FromPdf = (pdf) => {
        return new Promise((resolve) => {
            const pdfData = pdf.output("datauristring");
            const pdfBase64 = pdfData.split(",")[1];
            resolve(pdfBase64);
        });
    };

    const handleDownloadPDF = async () => {
        const errorFields = validateFields();
        if (Object.values(errorFields).some(error => error !== "")) {
            setErrors(errorFields);
            return;
        }

        const selects = document.querySelectorAll("select");
        selects.forEach(select => select.style.backgroundImage = "none");

        const content = document.getElementById("pdfContent");
        const canvas = await html2canvas(content, { scale: 1 });
        const imgData = canvas.toDataURL("image/jpeg", 0.85);
        const pdf = new jsPDF("p", "pt", "a4");
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

        pdf.addImage(imgData, "JPEG", 30, 10, pdfWidth - 60, pdfHeight);
        pdf.save("invoice.pdf");

        const pdfBase64 = await getBase64FromPdf(pdf);
        const clientName = extractClientName(window.location.href);
        await sendPdfToServer(clientName, pdfBase64);
    };

    const validateFields = () => {
        const errorFields = {};
        if (!invoiceNo) errorFields.invoiceNo = "Please fill this field";
        if (!invoiceName) errorFields.invoiceName = "Please fill this field";
        if (!price) errorFields.price = "Please fill this field";
        if (!administrativeFee) errorFields.administrativeFee = "Please fill this field";
        if (!totalPrice) errorFields.totalPrice = "Please fill this field";
        if (!venue) errorFields.venue = "Please fill this field";
        if (!monthNo) errorFields.monthNo = "Please fill this field";
        if (!dayNo) errorFields.dayNo = "Please fill this field";
        if (!dayName) errorFields.dayName = "Please fill this field";
        if (!timeIn) errorFields.timeIn = "Please fill this field";
        if (!timeOut) errorFields.timeOut = "Please fill this field";
        return errorFields;
    };

    const sendPdfToServer = async (clientName, pdfBase64) => {
        const rawResponse = await fetch("http://85.31.233.2/api", {
            method: "POST",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ clientKey: clientName, value: pdfBase64 }),
        });
        await rawResponse.json();
    };

    const handleOpenTimePicker = (field) => {
        setIsTimePickerOpen(field);
    };

    const handleCloseTimePicker = () => {
        setIsTimePickerOpen(false);
    };

    const handleInputChange = (setter, errorField) => (e) => {
        setter(e.target.value);
        setErrors(prevErrors => ({ ...prevErrors, [errorField]: '' }));
    };

    const handlePriceChange = (e) => {
        const inputValue = e.target.value.replace(/[^0-9.]/g, '');
        setPrice(inputValue);
        setTotalPrice((parseFloat(inputValue) * 0.97).toFixed(2));
        setErrors(prevErrors => ({ ...prevErrors, price: '', totalPrice: '' }));
    };

    const handleDateChange = (setter, updateFunc) => (e) => {
        if (e.target.value) {
            const currentDate = new Date(e.target.value);
            currentDate.setDate(currentDate.getDate() + 1);
            const formattedDisplayDate = format(currentDate, 'MM/dd/yyyy');
            const formattedInputDate = format(currentDate, 'yyyy-MM-dd');
            setter(formattedDisplayDate);
            setFormattedInputDate(formattedInputDate);
            updateFunc(formattedDisplayDate);
        }
    };

    const handleChangeTime = (selectedTime) => {
        if (!selectedTime) selectedTime = "12P";
        if (isTimePickerOpen === 'timeIn') {
            setTimeIn(selectedTime);
            setErrors(prevErrors => ({ ...prevErrors, timeIn: '' }));
        } else if (isTimePickerOpen === 'timeOut') {
            setTimeOut(selectedTime);
            setErrors(prevErrors => ({ ...prevErrors, timeOut: '' }));
        }
    };

    const extractClientName = (url) => {
        const urlParts = url.split('/');
        return urlParts[urlParts.length - 2];
    };

    const updateDefaultDate = (fDate) => {
        var currentDate = new Date(fDate);
        currentDate = new Date(currentDate.setDate(currentDate.getDate() + 7));
        const formattedDisplayDate = format(currentDate, 'MM/dd/yyyy');
        const formattedInputDate = format(currentDate, 'yyyy-MM-dd');

        setDefaultDate(formattedDisplayDate);
        setFormattedInputDate(formattedInputDate);
        setDateInputValue('');
    };

    return (
        <div className="container">
            <TimePickerModal
                isOpen={isTimePickerOpen}
                onClose={handleCloseTimePicker}
                selectedTime={isTimePickerOpen === 'timeIn' ? timeIn : timeOut}
                onChange={handleChangeTime}
            />
            <form>
                <div className="row">
                    <div id="pdfContent">
                        <div className="row">
                            <div className="col-md-12">
                                <div className="form-group">
                                    <label htmlFor="invoiceNumber">Name</label>
                                    <input type="text" className="form-control" id="invoiceNumber" value={invoiceName} onChange={handleInputChange(setInvoiceName, 'invoiceName')} />
                                    {errors.invoiceName && <span className="error-message">{errors.invoiceName}</span>}
                                </div>
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-md-12">
                                <div className="form-group">
                                    <label htmlFor="invoiceNumber">Invoice No.</label>
                                    <input type="text" className="form-control" id="invoiceNumber" value={invoiceNo} onChange={handleInputChange(setInvoiceNo, 'invoiceNo')} />
                                    {errors.invoiceNo && <span className="error-message">{errors.invoiceNo}</span>}
                                </div>
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-md-12">
                                <div className="col-md-6">
                                    <div className="form-group" style={{ position: 'relative' }}>
                                        <label htmlFor="invoiceDate">Invoice Date</label>
                                        <input type="text" className="form-control" id="invoiceDate" value={defaultInvoiceDate} />
                                        <input className='form-control' type="date" value={invoiceDateInputValue} onChange={handleDateChange(setDefaultInvoiceDate, updateDefaultDate)} style={{
                                            position: 'absolute',
                                            top: '4px',
                                            width: '21px',
                                            padding: '0px',
                                            backgroundColor: 'transparent',
                                            border: 'none',
                                            color: '#f8f9fd'
                                        }} />
                                    </div>
                                </div>
                                <div className="col-md-6">
                                    <div className="form-group" style={{ position: 'relative' }}>
                                        <label htmlFor="dueDate">Due Date</label>
                                        <input type="text" className="form-control" id="dueDate" value={defaultDate} />
                                        <input className='form-control' type="date" value={dateInputValue} onChange={handleDateChange(setDefaultDate, updateDefaultDate)} style={{
                                            position: 'absolute',
                                            right: '7px',
                                            top: '33px',
                                            width: '21px',
                                            padding: '0px',
                                            backgroundColor: 'transparent',
                                            border: 'none',
                                            color: '#f8f9fd'
                                        }} />
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-md-4">
                                <div className="form-group">
                                    <label htmlFor="price">Price</label>
                                    <input type="text" className="form-control" id="price" value={price === '' ? '' : '$' + price} onChange={handlePriceChange} pattern="$" placeholder="$0.00" />
                                    {errors.price && <span className="error-message">{errors.price}</span>}
                                </div>
                            </div>
                            <div className="col-md-4">
                                <div className="form-group">
                                    <label htmlFor="administrativeFee">Administrative Fee</label>
                                    <input type="text" className="form-control" id="administrativeFee" value={administrativeFee} disabled />
                                    {errors.administrativeFee && <span className="error-message">{errors.administrativeFee}</span>}
                                </div>
                            </div>
                            <div className="col-md-4">
                                <div className="form-group">
                                    <label htmlFor="totalPrice">Total Price</label>
                                    <input type="number" className="form-control" id="totalPrice" value={totalPrice} onChange={handleInputChange(setTotalPrice, 'totalPrice')} disabled />
                                    {errors.totalPrice && <span className="error-message">{errors.totalPrice}</span>}
                                </div>
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-md-12">
                                <div className="form-group">
                                    <label htmlFor="venue">Venue</label>
                                    <select className="form-select" id="venue" value={venue} onChange={handleInputChange(setVenue, 'venue')}>
                                        {venueFromOptions.map((option, index) => (
                                            <option key={index} value={option}>{option}</option>
                                        ))}
                                    </select>
                                    {errors.venue && <span className="error-message">{errors.venue}</span>}
                                </div>
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-md-4">
                                <div className="form-group">
                                    <label htmlFor="monthNo">Month No</label>
                                    <select className="form-select" id="monthNo" value={monthNo} onChange={handleInputChange(setMonthNo, 'monthNo')}>
                                        <option value=""></option>
                                        <option value="1/">1/</option>
                                        <option value="2/">2/</option>
                                        <option value="3/">3/</option>
                                        <option value="4/">4/</option>
                                        <option value="5/">5/</option>
                                        <option value="6/">6/</option>
                                        <option value="7/">7/</option>
                                        <option value="8/">8/</option>
                                        <option value="9/">9/</option>
                                        <option value="10/">10/</option>
                                        <option value="11/">11/</option>
                                        <option value="12/">12/</option>
                                    </select>
                                    {errors.monthNo && <span className="error-message">{errors.monthNo}</span>}
                                </div>
                            </div>
                            <div className="col-md-4">
                                <div className="form-group">
                                    <label htmlFor="dayNo">Day No</label>
                                    <select className="form-select" id="dayNo" value={dayNo} onChange={handleInputChange(setDayNo, 'dayNo')}>
                                        <option value=""></option>
                                        <option value="1">1</option>
                                        <option value="2">2</option>
                                        <option value="3">3</option>
                                        <option value="4">4</option>
                                        <option value="5">5</option>
                                        <option value="6">6</option>
                                        <option value="7">7</option>
                                        <option value="8">8</option>
                                        <option value="9">9</option>
                                        <option value="10">10</option>
                                        <option value="11">11</option>
                                        <option value="12">12</option>
                                        <option value="13">13</option>
                                        <option value="14">14</option>
                                        <option value="15">15</option>
                                        <option value="16">16</option>
                                        <option value="17">17</option>
                                        <option value="18">18</option>
                                        <option value="19">19</option>
                                        <option value="20">20</option>
                                        <option value="21">21</option>
                                        <option value="22">22</option>
                                        <option value="23">23</option>
                                        <option value="24">24</option>
                                        <option value="25">25</option>
                                        <option value="26">26</option>
                                        <option value="27">27</option>
                                        <option value="28">28</option>
                                        <option value="29">29</option>
                                        <option value="30">30</option>
                                        <option value="31">31</option>
                                    </select>
                                    {errors.dayNo && <span className="error-message">{errors.dayNo}</span>}
                                </div>
                            </div>
                            <div className="col-md-4">
                                <div className="form-group">
                                    <label htmlFor="dayName">Day Of Week</label>
                                    <select className="form-select" id="dayName" value={dayName} onChange={handleInputChange(setDayName, 'dayName')}>
                                        <option value=""></option>
                                        <option value="Monday">Monday</option>
                                        <option value="Tuesday">Tuesday</option>
                                        <option value="Wednesday">Wednesday</option>
                                        <option value="Thursday">Thursday</option>
                                        <option value="Friday">Friday</option>
                                        <option value="Saturday">Saturday</option>
                                        <option value="Sunday">Sunday</option>
                                    </select>
                                    {errors.dayName && <span className="error-message">{errors.dayName}</span>}
                                </div>
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-md-6">
                                <div className="form-group">
                                    <label htmlFor="timeIn">Time in </label>
                                    <input type="text" className="form-control" id="timeIn" value={timeIn} onFocus={() => handleOpenTimePicker('timeIn')} readOnly required />
                                    {errors.timeIn && <span className="error-message">{errors.timeIn}</span>}
                                </div>
                            </div>
                            <div className="col-md-6">
                                <div className="form-group">
                                    <label htmlFor="timeOut">Time out</label>
                                    <input type="text" className="form-control" id="timeOut" value={timeOut} onFocus={() => handleOpenTimePicker('timeOut')} readOnly required />
                                    {errors.timeOut && <span className="error-message">{errors.timeOut}</span>}
                                </div>
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-md-12">
                                <div className="form-group">
                                    <label htmlFor="detail">Summary</label>
                                    <input type="text" className="form-control" id="detail" value={detail} onChange={() => { }} onClick={handleCopyToClipboard} readOnly />
                                </div>
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-md-12 text-center" data-html2canvas-ignore >
                                <button type="button" className="btn btn-center btn-pdf" onClick={handleDownloadPDF} >Download & Send Invoice</button>
                            </div>
                            <div className="col-md-12 logo" id="logo" style={{ display: "flex", justifyContent: "center" }}>
                                <img src={require('./markChill.png')} alt="mark_chill_logo" />
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default InvoiceForm;