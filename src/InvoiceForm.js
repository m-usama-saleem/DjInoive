import './InvoiceForm.css';
import React, { useState, useEffect, useRef } from 'react';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import { saveAs } from 'file-saver';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import TimePickerModal from './TimePickerModal';
import './TimePickerModal.css';
import billFromListData from './data/bill_from_list.txt';
import name from './data/name.txt';
import venueFromListData from './data/venue_from_list.txt';
import { format } from 'date-fns';

const InvoiceForm = () => {
    const [billFrom, setBillFrom] = useState('');
    const [invoiceNo, setInvoiceNo] = useState('');
    const [invoiceName, setInvoiceName] = useState('');
    const [price, setPrice] = useState('');
    const [administrativeFee, setAdministrativeFee] = useState('3%');
    const [totalPrice, setTotalPrice] = useState('');
    const [venue, setVenue] = useState('');
    const [monthNo, setMonthNo] = useState('');
    const [dayNo, setDayNo] = useState('');
    const [dayName, setDayName] = useState('');
    const [timeIn, setTimeIn] = useState('');
    const [timeOut, setTimeOut] = useState('');
    const [detail, setDetail] = useState('');
    const [showTimePicker, setShowTimePicker] = useState(false);
    const [selectedTimeInput, setSelectedTimeInput] = useState('');
    const [isTimePickerOpen, setIsTimePickerOpen] = useState(false);
    const [nameHead, setNameHead] = useState(false);
    const [billFromOptions, setBillFromOptions] = useState([]);
    const [venueFromOptions, setVenueFromOptions] = useState([]);
    const [textContent, setTextContent] = useState('')
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

    // Function to clear errors
    const clearErrors = () => {
        setErrors({
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
    };
    useEffect(() => {
        // Collect data and display in the Detail input field whenever any input changes
        const detailText = `${venue} ${monthNo}${dayNo} ${dayName} ${timeIn}-${timeOut}`;
        setDetail(detailText);
        fetch(billFromListData)
            .then(response => response.text())
            .then(data => {
                // Split the text file content into lines and set them as options for the dropdown
                const billFromOptions = data.split('\n').map(option => option.trim());
                billFromOptions.unshift('');

                setBillFromOptions(billFromOptions);
            })
            .catch(error => console.error('Error loading "Bill From" options:', error));
        fetch(name)
            .then(response => response.text())
            .then(data => {
                setTextContent(data);
            })
            .catch(error => console.error('Error loading "Bill From" options:', error));
        fetch(venueFromListData)
            .then(response => response.text())
            .then(data => {
                // Split the text file content into lines and set them as options for the dropdown
                const venueFromOptions = data.split('\n').map(option => option.trim());
                venueFromOptions.unshift('');
                setVenueFromOptions(venueFromOptions);
            })
            .catch(error => console.error('Error loading "Venue From" options:', error));

    }, [venue, monthNo, dayNo, dayName, timeIn, timeOut]);
    useEffect(() => {
        const currentDate = new Date();
        debugger
        currentDate.setDate(currentDate.getDate() + 1);
        const formattedDisplayDate = format(currentDate, 'MM/dd/yyyy');
        const formattedInputDate = format(currentDate, 'yyyy-MM-dd');

        setDefaultInvoiceDate(formattedDisplayDate);

        // Optionally, you can set another state variable for the formatted input value
        setFormattedInputDate(formattedInputDate);
        setInvoiceDateInputValue('');

        updateDefaultDate(formattedDisplayDate);
    }, []);

    const handleTimeInputChange = (e) => {
        setSelectedTimeInput(e.target.id);
        setShowTimePicker(true);
    };
    // function to copy detail text 
    const handleCopyToClipboard = () => {
        const detailInput = document.getElementById('detail');

        // Select the text in the input field
        detailInput.select();

        // Copy the selected text to the clipboard
        document.execCommand('copy');

        // Deselect the text
        window.getSelection().removeAllRanges();

    };
    const getBase64FromPdf = (pdf) => {
        return new Promise((resolve) => {
            // Convert the PDF to a data URL
            const pdfData = pdf.output("datauristring");

            // Extract Base64 data from the data URL
            const pdfBase64 = pdfData.split(",")[1];

            resolve(pdfBase64);
        });
    }
    const handleDownloadPDF = async () => {
        console.log("function call");
        // Check if any required fields are empty before generating the PDF
        const errorFields = {};

        //if (!billFrom) errorFields.billFrom = 'Please fill this field';
        if (!invoiceNo) errorFields.invoiceNo = "Please fill this field";
        if (!invoiceName) errorFields.invoiceName = "Please fill this field";
        if (!price) errorFields.price = "Please fill this field";
        if (!administrativeFee)
            errorFields.administrativeFee = "Please fill this field";
        if (!totalPrice) errorFields.totalPrice = "Please fill this field";
        if (!venue) errorFields.venue = "Please fill this field";
        if (!monthNo) errorFields.monthNo = "Please fill this field";
        if (!dayNo) errorFields.dayNo = "Please fill this field";
        if (!dayName) errorFields.dayName = "Please fill this field";
        if (!timeIn) errorFields.timeIn = "Please fill this field";
        if (!timeOut) errorFields.timeOut = "Please fill this field";

        setErrors(errorFields);

        // Check if there are any errors
        const hasErrors = Object.values(errorFields).some(
            (error) => error !== ""
        );

        if (hasErrors) {
            // If there are errors, do not generate the PDF
            return;
        }
        debugger
        // Select all <select> elements
        var selects = document.querySelectorAll("select");

        // Iterate through each <select> element
        selects.forEach(function (select) {
            // Set the background image to none
            select.style.backgroundImage = "none";
        });

        const content = document.getElementById("pdfContent");

        // Use html2canvas to capture the content as a canvas
        const canvas = await html2canvas(content, { scale: 1 });

        // Convert the canvas to an image data URL with JPEG format and reduced quality
        const imgData = canvas.toDataURL("image/jpeg", 0.85);

        // Create a new jsPDF instance
        const pdf = new jsPDF("p", "pt", "a4");

        // Calculate the width and height of the content to fit in the PDF
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

        // Add the image to the PDF at position (30, 10) with the calculated width and height
        pdf.addImage(imgData, "JPEG", 30, 10, pdfWidth - 60, pdfHeight);

        // Save the PDF as a file
        pdf.save("invoice.pdf");

        // Get the Base64 representation of the PDF
        const pdfBase64 = await getBase64FromPdf(pdf);

        var clientName = extractClientName(window.location.href);
        const rawResponse = await fetch("http://85.31.233.2/api", {
            method: "POST",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ clientKey: clientName, value: pdfBase64 }),
        });
        const data = await rawResponse.json();
    };
    const handleOpenTimePicker = (field) => {
        // Open the time picker for the specified field (timeIn or timeOut)
        setIsTimePickerOpen(field);
    };

    const handleCloseTimePicker = () => {
        // Close the time picker
        setIsTimePickerOpen(false);
    };
    //const onBillFromChange = (e) => {
    //    setBillFrom(e.target.value);
    //    setErrors((prevErrors) => ({
    //        ...prevErrors,
    //        billFrom: '', // Clear the error for the 'billFrom' field
    //    }));
    //}
    const onInvoiceNameChange = (e) => {
        setInvoiceName(e.target.value);
        setErrors((prevErrors) => ({
            ...prevErrors,
            invoiceName: '',
        }));
    };
    const onInvoiceNoChange = (e) => {
        setInvoiceNo(e.target.value);
        setErrors((prevErrors) => ({
            ...prevErrors,
            invoiceNo: '',
        }));
    };
    const onPriceChange = (e) => {
        const inputValue = e.target.value;
        const numericValue = inputValue.replace(/[^0-9.]/g, '');

        setPrice(numericValue);
        var totlaprice = (parseFloat(numericValue) * 0.97).toFixed(2);

        setTotalPrice(totlaprice);
        setErrors((prevErrors) => ({
            ...prevErrors,
            price: '',
            totalPrice: ''
        }));
    }
    const onTotalPriceChange = (e) => {
        setTotalPrice(e.target.value);
        setErrors((prevErrors) => ({
            ...prevErrors,
            totalPrice: '', // Clear the error for the 'totalPrice' field
        }));
    }
    const onVenueChange = (e) => {
        setVenue(e.target.value);
        setErrors((prevErrors) => ({
            ...prevErrors,
            venue: '', // Clear the error for the 'venue' field
        }));
    }
    const onMonthNoChange = (e) => {
        setMonthNo(e.target.value);
        setErrors((prevErrors) => ({
            ...prevErrors,
            monthNo: '', // Clear the error for the 'monthNo' field
        }));
    }
    const onDayNoChange = (e) => {
        setDayNo(e.target.value);
        setErrors((prevErrors) => ({
            ...prevErrors,
            dayNo: '', // Clear the error for the 'dayNo' field
        }));
    }
    const onDayNameChange = (e) => {
        setDayName(e.target.value);
        setErrors((prevErrors) => ({
            ...prevErrors,
            dayName: '', // Clear the error for the 'dayName' field
        }));
    }

    const handleInvoiceDateChange = (e) => {
        if (e.target.value != null && e.target.value != undefined && e.target.value != "") {
            var currentDate = new Date(e.target.value);
            currentDate = new Date(currentDate.setDate(currentDate.getDate() + 1));
            // Format the date to MM/DD/YYYY for display
            const formattedDisplayDate = format(currentDate, 'MM/dd/yyyy');

            // Format the date to YYYY-MM-DD for the input value
            const formattedInputDate = format(currentDate, 'yyyy-MM-dd');

            setDefaultInvoiceDate(formattedDisplayDate);

            // Optionally, you can set another state variable for the formatted input value
            setFormattedInputDate(formattedInputDate);
            setInvoiceDateInputValue('');
            updateDefaultDate(formattedDisplayDate);
        }
    }

    const updateDefaultDate = (fDate) => {
        var currentDate = new Date(fDate);
        currentDate = new Date(currentDate.setDate(currentDate.getDate() + 7));
        // Format the date to MM/DD/YYYY for display
        const formattedDisplayDate = format(currentDate, 'MM/dd/yyyy');

        // Format the date to YYYY-MM-DD for the input value
        const formattedInputDate = format(currentDate, 'yyyy-MM-dd');

        setDefaultDate(formattedDisplayDate);

        // Optionally, you can set another state variable for the formatted input value
        setFormattedInputDate(formattedInputDate);
        setDateInputValue('');
    }

    const handleDateChange = (e) => {
        if (e.target.value != null && e.target.value != undefined && e.target.value != "") {
            var currentDate = new Date(e.target.value);
            currentDate = new Date(currentDate.setDate(currentDate.getDate() + 1));
            // Format the date to MM/DD/YYYY for display
            const formattedDisplayDate = format(currentDate, 'MM/dd/yyyy');

            // Format the date to YYYY-MM-DD for the input value
            const formattedInputDate = format(currentDate, 'yyyy-MM-dd');

            setDefaultDate(formattedDisplayDate);

            // Optionally, you can set another state variable for the formatted input value
            setFormattedInputDate(formattedInputDate);
            setDateInputValue('');
        }
    }
    const handleChangeTime = (selectedTime) => {
        debugger
        if (selectedTime === "") {
            selectedTime = "12P";
        }
        if (isTimePickerOpen === 'timeIn') {
            setTimeIn(selectedTime);
            setErrors((prevErrors) => ({
                ...prevErrors,
                timeIn: '',
            }));
        } else if (isTimePickerOpen === 'timeOut') {
            setTimeOut(selectedTime);
            setErrors((prevErrors) => ({
                ...prevErrors,
                timeOut: '',
            }));
        }
    };

    const extractClientName = (url) => {
        // Split the URL into parts using '/' as the delimiter
        const urlParts = url.split('/');

        // Extract the last part of the URL, which should be the client name
        const clientName = urlParts[urlParts.length - 2];

        return clientName;
    }
    return (
        <div className="container">
            {/* Pass the necessary props to the TimePickerModal */}
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
                            <div class="col-md-4">
                                <h1 id="invoice-heading">Invoice</h1>
                            </div>
                            <div class="col-md-8" style={{ textAlign: 'end' }}>
                                <h1 id='user'> {textContent}</h1>
                            </div>
                        </div>

                        <div className="row">
                            <div className="col-md-12">
                                <div className="form-group">
                                    <label htmlFor="invoiceNumber">Name</label>
                                    <input type="text" className="form-control" id="invoiceNumber" value={invoiceName} onChange={(e) => onInvoiceNameChange(e)} />
                                    {errors.invoiceName && <span className="error-message">{errors.invoiceName}</span>}
                                </div>
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-md-12">
                                <div className="form-group">
                                    <label htmlFor="invoiceNumber">Invoice No.</label>
                                    <input type="text" className="form-control" id="invoiceNumber" value={invoiceNo} onChange={(e) => onInvoiceNoChange(e)} />
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
                                        <input className='form-control' type="date" value={invoiceDateInputValue} onChange={e => handleInvoiceDateChange(e)} style={{
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
                                        <input className='form-control' type="date" value={dateInputValue} onChange={e => handleDateChange(e)} style={{
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
                                    <input type="text" className="form-control" id="price" value={price === '' ? '' : '$' + price} onChange={(e) => onPriceChange(e)} pattern="$"
                                        placeholder="$0.00" />  {errors.price && <span className="error-message">{errors.price}</span>}
                                </div>
                            </div>
                            <div className="col-md-4">
                                <div className="form-group">
                                    <label htmlFor="administrativeFee">Administrative Fee</label>
                                    <input type="text" className="form-control" id="administrativeFee" value={administrativeFee} disabled="true" />
                                    {errors.administrativeFee && <span className="error-message">{errors.administrativeFee}</span>}
                                </div>
                            </div>
                            <div className="col-md-4">
                                <div className="form-group">
                                    <label htmlFor="totalPrice">Total Price</label>
                                    <input type="number" className="form-control" id="totalPrice" value={totalPrice} onChange={(e) => onTotalPriceChange(e)} disabled="true" />
                                    {errors.totalPrice && <span className="error-message">{errors.totalPrice}</span>}
                                </div>
                            </div>
                        </div>

                        <div className="row">
                            <div className="col-md-12">
                                <div className="form-group">
                                    <label htmlFor="venue">Venue</label>
                                    <select
                                        className="form-select"
                                        id="venue"
                                        value={venue}
                                        onChange={(e) => onVenueChange(e)}
                                    >
                                        {venueFromOptions.map((option, index) => (
                                            <option key={index} value={option}>{option}</option>
                                        ))}
                                    </select>

                                    {/*<input type="text" className="form-control" id="venue" value={venue} onChange={(e) => onVenueChange(e)}/>*/}
                                    {errors.venue && <span className="error-message">{errors.venue}</span>}

                                </div>
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-md-4">
                                <div className="form-group">
                                    <label htmlFor="monthNo">Month No</label>
                                    <select className="form-select" id="monthNo" value={monthNo} onChange={(e) => onMonthNoChange(e)}>
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
                                    <select className="form-select" id="dayNo" value={dayNo} onChange={(e) => onDayNoChange(e)}>
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
                                    {/* <input type="number" min="1" max="31" step="1" className="form-control" id="dayNo" value={dayNo} onChange={(e) => onDayNoChange(e)}/> */}
                                    {errors.dayNo && <span className="error-message">{errors.dayNo}</span>}
                                </div>
                            </div>
                            <div className="col-md-4">
                                <div className="form-group">
                                    <label htmlFor="dayName">Day Of Week</label>
                                    <select className="form-select" id="dayName" value={dayName} onChange={(e) => onDayNameChange(e)}>
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