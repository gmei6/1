// Combined JavaScript file for Credit Log application.

// msgClasses.js content (modified)
/**
 * Base Message Class
 * Provides common properties and methods for all message types.
 */
class Message {
    /**
     * Constructs a new Message instance.
     * @param {string} type - The type of the message (e.g., 'MSG01').
     * @param {string} timestamp - The timestamp when the message was created.
     * @param {string} senderId - The ID of the sender.
     * @param {object} payload - The core data payload of the message.
     */
    constructor(type, timestamp, senderId, payload = {}) {
        this.type = type;
        this.timestamp = timestamp;
        this.senderId = senderId;
        this.payload = payload;
    }

    /**
     * Converts the message instance to a plain JavaScript object.
     * @returns {object} A plain object representation of the message.
     */
    toObject() {
        return {
            type: this.type,
            timestamp: this.timestamp,
            senderId: this.senderId,
            payload: this.payload,
        };
    }

    /**
     * Returns a string representation of the message.
     * @returns {string} A string representing the message.
     */
    toString() {
        return `[${this.type}] From: ${this.senderId} at ${this.timestamp} - Payload: ${JSON.stringify(this.payload)}`;
    }
}

/**
 * MSG01 Class: System Status Update / Detailed Agreement Data
 * This class is designed to parse and represent the complex XML structure
 * provided for MSG01 messages, containing detailed information about
 * message metadata, factor details, seller information, and agreement terms.
 */
class MSG01 extends Message {
    /**
     * Constructs a new MSG01 instance from parsed XML data.
     * @param {object} data - An object representing the parsed XML structure for MSG01.
     * @param {object} data.MsgInfo - Information about the message itself.
     * @param {string} data.MsgInfo.SenderCode
     * @param {string} data.MsgInfo.ReceiverCode
     * @param {string} data.MsgInfo.CreatedBy
     * @param {number} data.MsgInfo.SequenceNr
     * @param {string} data.MsgInfo.DateTime - ISO string format.
     * @param {number} data.MsgInfo.Status
     * @param {object} data.EF - Export Factor details.
     * @param {string} data.EF.FactorCode
     * @param {string} data.EF.FactorName
     * @param {object} data.IF - Import Factor details.
     * @param {string} data.IF.FactorCode
     * @param {string} data.IF.FactorName
     * @param {string} data.MsgDate - Date of the message (YYYY-MM-DD).
     * @param {number} data.MsgFunction - Function code of the message.
     * @param {string} data.FactAgreemSigned - Date when factoring agreement was signed (YYYY-MM-DD).
     * @param {object} data.Seller - Seller details.
     * @param {string} data.Seller.SellerNr
     * @param {string} data.Seller.SellerName
     * @param {string} data.Seller.NameCont
     * @param {string} data.Seller.Street
     * @param {string} data.Seller.City
     * @param {string} data.Seller.State
     * @param {string} data.Seller.Postcode
     * @param {string} data.Seller.Country
     * @param {object} data.SellerDetails - Additional seller business details.
     * @param {string} data.SellerDetails.BusinessProduct
     * @param {number} data.SellerDetails.NetPmtTerms
     * @param {number|null} data.SellerDetails.Discount1Days
     * @param {number|null} data.SellerDetails.Discount2Days
     * @param {number|null} data.SellerDetails.GracePeriod
     * @param {string} data.SellerDetails.InvCurrency1
     * @param {number} data.SellerDetails.ChargeBackPerc
     * @param {number} data.SellerDetails.ChargeBackAmt
     * @param {string} data.SellerDetails.ChargeBackCurrency
     * @param {number} data.SellerDetails.ExpTotSellerTurnover
     * @param {number} data.SellerDetails.ExpNrBuyers
     * @param {number} data.SellerDetails.ExpNrInvoices
     * @param {number|null} data.SellerDetails.ExpNrCreditNotes
     * @param {number} data.SellerDetails.ExpTurnover
     * @param {number} data.SellerDetails.ExpOtherTurnover
     * @param {number} data.SellerDetails.OtherFactors
     * @param {number} data.SellerDetails.ServiceRequired
     * @param {object} [data.BankDetailsSeller] - Optional bank details for the seller.
     * @param {string} [data.MsgText] - Optional free text message.
     */
    constructor(data) {
        // Extract base Message properties from the XML data's MsgInfo
        const type = 'MSG01';
        const timestamp = data.MsgInfo.DateTime;
        const senderId = data.MsgInfo.SenderCode;

        // The entire data object becomes the payload for this complex message
        super(type, timestamp, senderId, data);

        // Assign parsed data directly to properties for easier access
        this.msgInfo = data.MsgInfo;
        this.ef = data.EF;
        this._if = data.IF; // Renamed to _if to avoid 'if' keyword conflict
        this.msgDate = data.MsgDate;
        this.msgFunction = data.MsgFunction;
        this.factAgreemSigned = data.FactAgreemSigned;
        this.seller = data.Seller;
        this.sellerDetails = data.SellerDetails;
        this.bankDetailsSeller = data.BankDetailsSeller || {}; // Initialize as empty object if not present
        this.msgText = data.MsgText || ''; // Initialize as empty string if not present
    }

    /**
     * Static method to create an MSG01 instance from an XML string.
     * This method uses DOMParser, which is available in browser environments.
     * If running in Node.js, you would need a library like `jsdom` or `xmldom`.
     * @param {string} xmlString - The XML string representing an MSG01 message.
     * @returns {MSG01} A new MSG01 instance.
     * @throws {Error} If XML parsing fails or required data is missing.
     */
    static fromXMLString(xmlString) {
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlString, "application/xml");

        // Check for parsing errors
        const errorNode = xmlDoc.querySelector('parsererror');
        if (errorNode) {
            console.error('XML Parsing Error:', errorNode.textContent);
            throw new Error('Failed to parse XML string.');
        }

        const getElementText = (element, tagName) => {
            const node = element.querySelector(tagName);
            return node ? node.textContent : null;
        };

        const getElementNumber = (element, tagName) => {
            const text = getElementText(element, tagName);
            return text !== null && text !== '' ? Number(text) : null;
        };

        const root = xmlDoc.querySelector('MSG01');
        if (!root) {
            throw new Error('Invalid MSG01 XML structure: Root <MSG01> element not found.');
        }

        const msgInfoElement = root.querySelector('MsgInfo');
        if (!msgInfoElement) {
            throw new Error('Invalid MSG01 XML structure: <MsgInfo> element not found.');
        }

        const efElement = root.querySelector('EF');
        if (!efElement) {
            throw new Error('Invalid MSG01 XML structure: <EF> element not found.');
        }

        const ifElement = root.querySelector('IF');
        if (!ifElement) {
            throw new Error('Invalid MSG01 XML structure: <IF> element not found.');
        }

        const sellerElement = root.querySelector('Seller');
        if (!sellerElement) {
            throw new Error('Invalid MSG01 XML structure: <Seller> element not found.');
        }

        const sellerDetailsElement = root.querySelector('SellerDetails');
        if (!sellerDetailsElement) {
            throw new Error('Invalid MSG01 XML structure: <SellerDetails> element not found.');
        }

        const data = {
            MsgInfo: {
                SenderCode: getElementText(msgInfoElement, 'SenderCode'),
                ReceiverCode: getElementText(msgInfoElement, 'ReceiverCode'),
                CreatedBy: getElementText(msgInfoElement, 'CreatedBy'),
                SequenceNr: getElementNumber(msgInfoElement, 'SequenceNr'),
                DateTime: getElementText(msgInfoElement, 'DateTime'),
                Status: getElementNumber(msgInfoElement, 'Status'),
            },
            EF: {
                FactorCode: getElementText(efElement, 'FactorCode'),
                FactorName: getElementText(efElement, 'FactorName'),
            },
            IF: {
                FactorCode: getElementText(ifElement, 'FactorCode'),
                FactorName: getElementText(ifElement, 'FactorName'),
            },
            MsgDate: getElementText(root, 'MsgDate'),
            MsgFunction: getElementNumber(root, 'MsgFunction'),
            FactAgreemSigned: getElementText(root, 'FactAgreemSigned'),
            Seller: {
                SellerNr: getElementText(sellerElement, 'SellerNr'),
                SellerName: getElementText(sellerElement, 'SellerName'),
                NameCont: getElementText(sellerElement, 'NameCont'), // Can be empty
                Street: getElementText(sellerElement, 'Street'),
                City: getElementText(sellerElement, 'City'),
                State: getElementText(sellerElement, 'State'), // Can be empty
                Postcode: getElementText(sellerElement, 'Postcode'),
                Country: getElementText(sellerElement, 'Country'),
            },
            SellerDetails: {
                BusinessProduct: getElementText(sellerDetailsElement, 'BusinessProduct'),
                NetPmtTerms: getElementNumber(sellerDetailsElement, 'NetPmtTerms'),
                Discount1Days: getElementNumber(sellerDetailsElement, 'Discount1Days'),
                Discount2Days: getElementNumber(sellerDetailsElement, 'Discount2Days'),
                GracePeriod: getElementNumber(sellerDetailsElement, 'GracePeriod'),
                InvCurrency1: getElementText(sellerDetailsElement, 'InvCurrency1'),
                ChargeBackPerc: getElementNumber(sellerDetailsElement, 'ChargeBackPerc'),
                ChargeBackAmt: getElementNumber(sellerDetailsElement, 'ChargeBackAmt'),
                ChargeBackCurrency: getElementText(sellerDetailsElement, 'ChargeBackCurrency'),
                ExpTotSellerTurnover: getElementNumber(sellerDetailsElement, 'ExpTotSellerTurnover'),
                ExpNrBuyers: getElementNumber(sellerDetailsElement, 'ExpNrBuyers'),
                ExpNrInvoices: getElementNumber(sellerDetailsElement, 'ExpNrInvoices'),
                ExpNrCreditNotes: getElementNumber(sellerDetailsElement, 'ExpNrCreditNotes'), // Can be empty
                ExpTurnover: getElementNumber(sellerDetailsElement, 'ExpTurnover'),
                ExpOtherTurnover: getElementNumber(sellerDetailsElement, 'ExpOtherTurnover'),
                OtherFactors: getElementNumber(sellerDetailsElement, 'OtherFactors'),
                ServiceRequired: getElementNumber(sellerDetailsElement, 'ServiceRequired'),
            },
            BankDetailsSeller: root.querySelector('BankDetailsSeller') ? {} : null, // Empty if exists, null if not
            MsgText: getElementText(root, 'MsgText'),
        };

        return new MSG01(data);
    }

    /**
     * Get the sender code from the message info.
     * @returns {string} The sender code.
     */
    getSenderCode() {
        return this.msgInfo.SenderCode;
    }

    /**
     * Get the created date and time as a Date object.
     * @returns {Date} The created date and time.
     */
    getCreationDateTime() {
        return new Date(this.msgInfo.DateTime);
    }

    /**
     * Get the seller's name.
     * @returns {string} The seller's name.
     */
    getSellerName() {
        return this.seller.SellerName;
    }

    /**
     * Get the business product from seller details.
     * @returns {string} The business product.
     */
    getBusinessProduct() {
        return this.sellerDetails.BusinessProduct;
    }
}

/**
 * MSG02 Class: User Login Event / Preliminary Credit Assessment Request
 * This class is designed to parse and represent the complex XML structure
 * provided for MSG02 messages, containing details about message metadata,
 * factor details, seller, buyer, and preliminary credit assessment request.
 */
class MSG02 extends Message {
    /**
     * Constructs a new MSG02 instance from parsed XML data.
     * @param {object} data - An object representing the parsed XML structure for MSG02.
     * @param {object} data.MsgInfo - Information about the message itself.
     * @param {string} data.MsgInfo.SenderCode
     * @param {string} data.MsgInfo.ReceiverCode
     * @param {string} data.MsgInfo.CreatedBy
     * @param {number} data.MsgInfo.SequenceNr
     * @param {string} data.MsgInfo.DateTime - ISO string format.
     * @param {number} data.MsgInfo.Status
     * @param {object} data.EF - Export Factor details.
     * @param {string} data.EF.FactorCode
     * @param {string} data.EF.FactorName
     * @param {object} data.IF - Import Factor details.
     * @param {string} data.IF.FactorCode
     * @param {string} data.IF.FactorName
     * @param {string} data.RequestDate - Date of the request (YYYY-MM-DD).
     * @param {string} data.RequestNr - Unique request number.
     * @param {number} data.MsgFunction - Function code of the message.
     * @param {object} data.Seller - Seller details.
     * @param {string} data.Seller.SellerNr
     * @param {string} data.Seller.SellerName
     * @param {object} data.Buyer - Buyer details.
     * @param {string} data.Buyer.BuyerNr
     * @param {string} data.Buyer.BuyerName
     * @param {string} data.Buyer.Street
     * @param {string} data.Buyer.City
     * @param {string} data.Buyer.State
     * @param {string} data.Buyer.Postcode
     * @param {string} data.Buyer.Country
     * @param {number} data.Buyer.DirectContact
     * @param {object} [data.BankDetailsBuyer] - Optional bank details for the buyer.
     * @param {object} data.PrelCreditAssessDetails - Preliminary credit assessment details.
     * @param {number} data.PrelCreditAssessDetails.AmtCreditAssessReq
     * @param {string} data.PrelCreditAssessDetails.Currency
     * @param {number} data.PrelCreditAssessDetails.NetPmtTerms
     * @param {number|null} data.PrelCreditAssessDetails.Discount1Days
     * @param {number|null} data.PrelCreditAssessDetails.Discount2Days
     * @param {string} [data.MsgText] - Optional free text message.
     */
    constructor(data) {
        const type = 'MSG02';
        const timestamp = data.MsgInfo.DateTime;
        const senderId = data.MsgInfo.SenderCode;

        super(type, timestamp, senderId, data);

        this.msgInfo = data.MsgInfo;
        this.ef = data.EF;
        this._if = data.IF;
        this.requestDate = data.RequestDate;
        this.requestNr = data.RequestNr;
        this.msgFunction = data.MsgFunction;
        this.seller = data.Seller;
        this.buyer = data.Buyer;
        this.bankDetailsBuyer = data.BankDetailsBuyer || {};
        this.prelCreditAssessDetails = data.PrelCreditAssessDetails;
        this.msgText = data.MsgText || '';
    }

    /**
     * Static method to create an MSG02 instance from an XML string.
     * This method uses DOMParser, which is available in browser environments.
     * If running in Node.js, you would need a library like `jsdom` or `xmldom`.
     * @param {string} xmlString - The XML string representing an MSG02 message.
     * @returns {MSG02} A new MSG02 instance.
     * @throws {Error} If XML parsing fails or required data is missing.
     */
    static fromXMLString(xmlString) {
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlString, "application/xml");

        // Check for parsing errors
        const errorNode = xmlDoc.querySelector('parsererror');
        if (errorNode) {
            console.error('XML Parsing Error:', errorNode.textContent);
            throw new Error('Failed to parse XML string.');
        }

        const getElementText = (element, tagName) => {
            const node = element.querySelector(tagName);
            return node ? node.textContent : null;
        };

        const getElementNumber = (element, tagName) => {
            const text = getElementText(element, tagName);
            return text !== null && text !== '' ? Number(text) : null;
        };

        const root = xmlDoc.querySelector('MSG02');
        if (!root) {
            throw new Error('Invalid MSG02 XML structure: Root <MSG02> element not found.');
        }

        const msgInfoElement = root.querySelector('MsgInfo');
        if (!msgInfoElement) {
            throw new Error('Invalid MSG02 XML structure: <MsgInfo> element not found.');
        }

        const efElement = root.querySelector('EF');
        if (!efElement) {
            throw new Error('Invalid MSG02 XML structure: <EF> element not found.');
        }

        const ifElement = root.querySelector('IF');
        if (!ifElement) {
            throw new Error('Invalid MSG02 XML structure: <IF> element not found.');
        }

        const sellerElement = root.querySelector('Seller');
        if (!sellerElement) {
            throw new Error('Invalid MSG02 XML structure: <Seller> element not found.');
        }

        const buyerElement = root.querySelector('Buyer');
        if (!buyerElement) {
            throw new Error('Invalid MSG02 XML structure: <Buyer> element not found.');
        }

        const prelCreditAssessDetailsElement = root.querySelector('PrelCreditAssessDetails');
        if (!prelCreditAssessDetailsElement) {
            throw new Error('Invalid MSG02 XML structure: <PrelCreditAssessDetails> element not found.');
        }

        const data = {
            MsgInfo: {
                SenderCode: getElementText(msgInfoElement, 'SenderCode'),
                ReceiverCode: getElementText(msgInfoElement, 'ReceiverCode'),
                CreatedBy: getElementText(msgInfoElement, 'CreatedBy'),
                SequenceNr: getElementNumber(msgInfoElement, 'SequenceNr'),
                DateTime: getElementText(msgInfoElement, 'DateTime'),
                Status: getElementNumber(msgInfoElement, 'Status'),
            },
            EF: {
                FactorCode: getElementText(efElement, 'FactorCode'),
                FactorName: getElementText(efElement, 'FactorName'),
            },
            IF: {
                FactorCode: getElementText(ifElement, 'FactorCode'),
                FactorName: getElementText(ifElement, 'FactorName'),
            },
            RequestDate: getElementText(root, 'RequestDate'),
            RequestNr: getElementText(root, 'RequestNr'),
            MsgFunction: getElementNumber(root, 'MsgFunction'),
            Seller: {
                SellerNr: getElementText(sellerElement, 'SellerNr'),
                SellerName: getElementText(sellerElement, 'SellerName'),
            },
            Buyer: {
                BuyerNr: getElementText(buyerElement, 'BuyerNr'),
                BuyerName: getElementText(buyerElement, 'BuyerName'),
                Street: getElementText(buyerElement, 'Street'),
                City: getElementText(buyerElement, 'City'),
                State: getElementText(buyerElement, 'State'),
                Postcode: getElementText(buyerElement, 'Postcode'),
                Country: getElementText(buyerElement, 'Country'),
                DirectContact: getElementNumber(buyerElement, 'DirectContact'),
            },
            BankDetailsBuyer: root.querySelector('BankDetailsBuyer') ? {} : null, // Empty object if exists, null if not
            PrelCreditAssessDetails: {
                AmtCreditAssessReq: getElementNumber(prelCreditAssessDetailsElement, 'AmtCreditAssessReq'),
                Currency: getElementText(prelCreditAssessDetailsElement, 'Currency'),
                NetPmtTerms: getElementNumber(prelCreditAssessDetailsElement, 'NetPmtTerms'),
                Discount1Days: getElementNumber(prelCreditAssessDetailsElement, 'Discount1Days'), // Can be empty
                Discount2Days: getElementNumber(prelCreditAssessDetailsElement, 'Discount2Days'), // Can be empty
            },
            MsgText: getElementText(root, 'MsgText'), // Can be empty
        };

        return new MSG02(data);
    }

    /**
     * Get the request number for this MSG02 message.
     * @returns {string} The request number.
     */
    getRequestNumber() {
        return this.requestNr;
    }

    /**
     * Get the buyer's name.
     * @returns {string} The buyer's name.
     */
    getBuyerName() {
        return this.buyer.BuyerName;
    }

    /**
     * Get the requested credit assessment amount.
     * @returns {number} The amount requested for credit assessment.
     */
    getRequestedCreditAmount() {
        return this.prelCreditAssessDetails.AmtCreditAssessReq;
    }

    /**
     * Get the currency of the requested credit assessment.
     * @returns {string} The currency.
     */
    getRequestedCreditCurrency() {
        return this.prelCreditAssessDetails.Currency;
    }
}

/**
 * MSG05 Class: Credit Cover Request
 * Represents an MSG05 message, which is a formal request for credit cover.
 * This is typically a more detailed request than an MSG02 and involves specific amounts and terms.
 */
class MSG05 extends Message {
    /**
     * Constructs a new MSG05 instance from parsed XML data.
     * @param {object} data - An object representing the parsed XML structure for MSG05.
     * @param {object} data.MsgInfo
     * @param {string} data.MsgInfo.SenderCode
     * @param {string} data.MsgInfo.ReceiverCode
     * @param {string} data.MsgInfo.CreatedBy
     * @param {number} data.MsgInfo.SequenceNr
     * @param {string} data.MsgInfo.DateTime
     * @param {number} data.MsgInfo.Status
     * @param {object} data.EF
     * @param {string} data.EF.FactorCode
     * @param {string} data.EF.FactorName
     * @param {object} data.IF
     * @param {string} data.IF.FactorCode
     * @param {string} data.IF.FactorName
     * @param {string} data.RequestDate
     * @param {string} data.RequestNr
     * @param {number} data.MsgFunction
     * @param {object} data.Seller
     * @param {string} data.Seller.SellerNr
     * @param {string} data.Seller.SellerName
     * @param {object} data.Buyer
     * @param {number} data.Buyer.BuyerCompanyRegNr
     * @param {string} data.Buyer.BuyerNr
     * @param {string} data.Buyer.BuyerName
     * @param {string} data.Buyer.Street
     * @param {string} data.Buyer.City
     * @param {string} data.Buyer.Postcode
     * @param {string} data.Buyer.Country
     * @param {number} data.Buyer.DirectContact
     * @param {string|null} data.Buyer.Telephone
     * @param {object} [data.BankDetailsBuyer]
     * @param {object} data.CreditCoverDetails
     * @param {number} data.CreditCoverDetails.Request
     * @param {number} data.CreditCoverDetails.NewCreditCoverAmt
     * @param {string} data.CreditCoverDetails.Currency
     * @param {number} data.CreditCoverDetails.OwnRiskAmt
     * @param {number} data.CreditCoverDetails.OwnRiskPerc
     * @param {number} data.CreditCoverDetails.NetPmtTerms
     * @param {number|null} data.CreditCoverDetails.Discount1Days
     * @param {number|null} data.CreditCoverDetails.Discount1Perc
     * @param {number|null} data.CreditCoverDetails.Discount2Days
     * @param {number|null} data.CreditCoverDetails.Discount2Perc
     * @param {number|null} data.CreditCoverDetails.OrderNr
     * @param {string} [data.MsgText]
     */
    constructor(data) {
        // Set up the base message properties.
        const type = 'MSG05';
        const timestamp = data.MsgInfo.DateTime;
        const senderId = data.MsgInfo.SenderCode;

        // Initialize the base class and the payload.
        super(type, timestamp, senderId, data);

        this.msgInfo = data.MsgInfo;
        this.ef = data.EF;
        this._if = data.IF;
        this.requestDate = data.RequestDate;
        this.requestNr = data.RequestNr;
        this.msgFunction = data.MsgFunction;
        this.seller = data.Seller;
        this.buyer = data.Buyer;
        this.bankDetailsBuyer = data.BankDetailsBuyer || {};
        this.creditCoverDetails = data.CreditCoverDetails;
        this.msgText = data.MsgText || '';
    }

    /**
     * Static factory method to create an MSG05 instance from a raw XML string.
     * Encapsulates the parsing logic for this specific message type.
     * @param {string} xmlString - The XML string representing an MSG05 message.
     * @returns {MSG05} A new MSG05 instance.
     * @throws {Error} If XML parsing fails or required data is missing.
     */
    static fromXMLString(xmlString) {
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlString, "application/xml");

        // Check for parsing errors.
        const errorNode = xmlDoc.querySelector('parsererror');
        if (errorNode) {
            console.error('XML Parsing Error:', errorNode.textContent);
            throw new Error('Failed to parse XML string.');
        }

        // Helper function to safely get text content.
        const getElementText = (element, tagName) => {
            const node = element.querySelector(tagName);
            return node ? node.textContent : null;
        };

        // Helper function to safely get and convert text to a number.
        const getElementNumber = (element, tagName) => {
            const text = getElementText(element, tagName);
            return text !== null && text !== '' ? Number(text) : null;
        };

        // Find the root <MSG05> element.
        const root = xmlDoc.querySelector('MSG05');
        if (!root) {
            throw new Error('Invalid MSG05 XML structure: Root <MSG05> element not found.');
        }

        // Locate all major sections of the XML to ensure the structure is valid.
        const msgInfoElement = root.querySelector('MsgInfo');
        const efElement = root.querySelector('EF');
        const ifElement = root.querySelector('IF');
        const sellerElement = root.querySelector('Seller');
        const buyerElement = root.querySelector('Buyer');
        const creditCoverDetailsElement = root.querySelector('CreditCoverDetails');

        // This validation step is crucial. It confirms that the XML document has the expected
        // high-level structure before we try to access deeper, nested data, which prevents
        // "Cannot read properties of null" errors.
        if (!msgInfoElement || !efElement || !ifElement || !sellerElement || !buyerElement || !creditCoverDetailsElement) {
            throw new Error('Missing required elements in MSG05 XML.');
        }

        const data = {
            MsgInfo: {
                SenderCode: getElementText(msgInfoElement, 'SenderCode'),
                ReceiverCode: getElementText(msgInfoElement, 'ReceiverCode'),
                CreatedBy: getElementText(msgInfoElement, 'CreatedBy'),
                SequenceNr: getElementNumber(msgInfoElement, 'SequenceNr'),
                DateTime: getElementText(msgInfoElement, 'DateTime'),
                Status: getElementNumber(msgInfoElement, 'Status'),
            },
            EF: {
                FactorCode: getElementText(efElement, 'FactorCode'),
                FactorName: getElementText(efElement, 'FactorName'),
            },
            IF: {
                FactorCode: getElementText(ifElement, 'FactorCode'),
                FactorName: getElementText(ifElement, 'FactorName'),
            },
            RequestDate: getElementText(root, 'RequestDate'),
            RequestNr: getElementText(root, 'RequestNr'),
            MsgFunction: getElementNumber(root, 'MsgFunction'),
            Seller: {
                SellerNr: getElementText(sellerElement, 'SellerNr'),
                SellerName: getElementText(sellerElement, 'SellerName'),
            },
            Buyer: {
                BuyerCompanyRegNr: getElementNumber(buyerElement, 'BuyerCompanyRegNr'),
                BuyerNr: getElementText(buyerElement, 'BuyerNr'),
                BuyerName: getElementText(buyerElement, 'BuyerName'),
                Street: getElementText(buyerElement, 'Street'),
                City: getElementText(buyerElement, 'City'),
                Postcode: getElementText(buyerElement, 'Postcode'),
                Country: getElementText(buyerElement, 'Country'),
                DirectContact: getElementNumber(buyerElement, 'DirectContact'),
                Telephone: getElementText(buyerElement, 'Telephone'), // Can be null
            },
            BankDetailsBuyer: root.querySelector('BankDetailsBuyer') ? {} : null,
            CreditCoverDetails: {
                Request: getElementNumber(creditCoverDetailsElement, 'Request'),
                NewCreditCoverAmt: getElementNumber(creditCoverDetailsElement, 'NewCreditCoverAmt'),
                Currency: getElementText(creditCoverDetailsElement, 'Currency'),
                OwnRiskAmt: getElementNumber(creditCoverDetailsElement, 'OwnRiskAmt'),
                OwnRiskPerc: getElementNumber(creditCoverDetailsElement, 'OwnRiskPerc'),
                NetPmtTerms: getElementNumber(creditCoverDetailsElement, 'NetPmtTerms'),
                Discount1Days: getElementNumber(creditCoverDetailsElement, 'Discount1Days'),
                Discount1Perc: getElementNumber(creditCoverDetailsElement, 'Discount1Perc'),
                Discount2Days: getElementNumber(creditCoverDetailsElement, 'Discount2Days'),
                Discount2Perc: getElementNumber(creditCoverDetailsElement, 'Discount2Perc'),
                OrderNr: getElementNumber(creditCoverDetailsElement, 'OrderNr'),
            },
            MsgText: getElementText(root, 'MsgText'),
        };
        // Create and return a new instance with the parsed data.
        return new MSG05(data);
    }

    /**
     * Getter for the requested new credit cover amount.
     * @returns {number} The new credit cover amount.
     */
    getNewCreditCoverAmount() {
        return this.creditCoverDetails.NewCreditCoverAmt;
    }

    /**
     * Getter for the buyer's country code.
     * @returns {string} The buyer's country code.
     */
    getBuyerCountry() {
        return this.buyer.Country;
    }

    /**
     * Getter for the net payment terms.
     * @returns {number} The net payment terms in days.
     */
    getCreditCoverNetPmtTerms() {
        return this.creditCoverDetails.NetPmtTerms;
    }
}

/**
 * MSG07 Class: Credit Cover Update/Status
 * Represents an MSG07 message, which communicates an update or status about a credit cover.
 * This can include approvals, denials, modifications, or expirations of credit lines.
 */
class MSG07 extends Message {
    /**
     * Constructs a new MSG07 instance from parsed XML data.
     * @param {object} data - An object representing the parsed XML structure for MSG07.
     * @param {object} data.MsgInfo - Message metadata.
     * @param {string} data.MsgInfo.SenderCode
     * @param {string} data.MsgInfo.ReceiverCode
     * @param {string} data.MsgInfo.CreatedBy
     * @param {number} data.MsgInfo.SequenceNr
     * @param {string} data.MsgInfo.DateTime
     * @param {number} data.MsgInfo.Status
     * @param {object} data.EF - Export Factor details.
     * @param {string} data.EF.FactorCode
     * @param {string} data.EF.FactorName
     * @param {object} data.IF
     * @param {string} data.IF.FactorCode
     * @param {string} data.IF.FactorName
     * @param {string} data.RequestDate
     * @param {string} data.RequestNr
     * @param {number} data.MsgFunction
     * @param {object} data.Seller - Seller details.
     * @param {string} data.Seller.SellerNr
     * @param {string} data.Seller.SellerName
     * @param {object} data.Buyer - Buyer details.
     * @param {string} data.Buyer.BuyerNr
     * @param {string} data.Buyer.BuyerName
     * @param {object} data.CurrentCreditCoverDetails - Details about the existing credit cover.
     * @param {number} data.CurrentCreditCoverDetails.CurrentCreditCoverAmt
     * @param {string} data.CurrentCreditCoverDetails.Currency
     * @param {object} data.NewCreditCoverDetails - Details about the new or updated credit cover.
     * @param {number} data.NewCreditCoverDetails.Request
     * @param {number} data.NewCreditCoverDetails.NewCreditCoverAmt
     * @param {string} data.NewCreditCoverDetails.ValidFrom
     * @param {number} data.NewCreditCoverDetails.LongCreditPeriodDays
     * @param {object} [data.OwnRiskNewCreditCover] - Optional details about own risk.
     * @param {string} [data.MsgText] - Optional free text message.
     */
    constructor(data) {
        // Set up the base message properties.
        const type = 'MSG07';
        const timestamp = data.MsgInfo.DateTime;
        const senderId = data.MsgInfo.SenderCode;

        // Initialize the base class and the payload, and assign all data to instance properties
        // for direct and easy access.
        super(type, timestamp, senderId, data);

        this.msgInfo = data.MsgInfo;
        this.ef = data.EF;
        this._if = data.IF;
        this.requestDate = data.RequestDate;
        this.requestNr = data.RequestNr;
        this.msgFunction = data.MsgFunction;
        this.seller = data.Seller;
        this.buyer = data.Buyer;
        this.currentCreditCoverDetails = data.CurrentCreditCoverDetails;
        this.newCreditCoverDetails = data.NewCreditCoverDetails;
        // Ensure optional properties have a default value to prevent runtime errors.
        this.ownRiskNewCreditCover = data.OwnRiskNewCreditCover || {};
        this.msgText = data.MsgText || '';
    }

    /**
     * Static factory method to create an MSG07 instance from a raw XML string.
     * Encapsulates the parsing logic for this specific message type.
     * @param {string} xmlString - The XML string representing an MSG07 message.
     * @returns {MSG07} A new MSG07 instance.
     * @throws {Error} If XML parsing fails or required data is missing.
     */
    static fromXMLString(xmlString) {
        // Use the browser's standard DOMParser.
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlString, "application/xml");

        // Check for a parser-generated error node, which indicates malformed XML.
        const errorNode = xmlDoc.querySelector('parsererror');
        if (errorNode) {
            console.error('XML Parsing Error:', errorNode.textContent);
            throw new Error('Failed to parse XML string.');
        }

        // Reusable helper to safely extract text content.
        const getElementText = (element, tagName) => {
            const node = element.querySelector(tagName);
            return node ? node.textContent : null;
        };

        // Reusable helper to safely extract and convert to a number.
        const getElementNumber = (element, tagName) => {
            const text = getElementText(element, tagName);
            return text !== null && text !== '' ? Number(text) : null;
        };

        // Validate the presence of the root element.
        const root = xmlDoc.querySelector('MSG07');
        if (!root) {
            throw new Error('Invalid MSG07 XML structure: Root <MSG07> element not found.');
        }

        // Locate all major sections of the XML to ensure the structure is valid.
        const msgInfoElement = root.querySelector('MsgInfo');
        const efElement = root.querySelector('EF');
        const ifElement = root.querySelector('IF');
        const sellerElement = root.querySelector('Seller');
        const buyerElement = root.querySelector('Buyer');
        const currentCreditCoverDetailsElement = root.querySelector('CurrentCreditCoverDetails');
        const newCreditCoverDetailsElement = root.querySelector('NewCreditCoverDetails');

        // This validation step is crucial. It confirms that the XML document has the expected
        // high-level structure before we try to access deeper, nested data.
        if (!msgInfoElement || !efElement || !ifElement || !sellerElement || !buyerElement || !currentCreditCoverDetailsElement || !newCreditCoverDetailsElement) {
            throw new Error('Missing required elements in MSG07 XML.');
        }

        const data = {
            MsgInfo: {
                SenderCode: getElementText(msgInfoElement, 'SenderCode'),
                ReceiverCode: getElementText(msgInfoElement, 'ReceiverCode'),
                CreatedBy: getElementText(msgInfoElement, 'CreatedBy'),
                SequenceNr: getElementNumber(msgInfoElement, 'SequenceNr'),
                DateTime: getElementText(msgInfoElement, 'DateTime'),
                Status: getElementNumber(msgInfoElement, 'Status'),
            },
            EF: {
                FactorCode: getElementText(efElement, 'FactorCode'),
                FactorName: getElementText(efElement, 'FactorName'),
            },
            IF: {
                FactorCode: getElementText(ifElement, 'FactorCode'),
                FactorName: getElementText(ifElement, 'FactorName'),
            },
            RequestDate: getElementText(root, 'RequestDate'),
            RequestNr: getElementText(root, 'RequestNr'),
            MsgFunction: getElementNumber(root, 'MsgFunction'),
            Seller: {
                SellerNr: getElementText(sellerElement, 'SellerNr'),
                SellerName: getElementText(sellerElement, 'SellerName'),
            },
            Buyer: {
                BuyerNr: getElementText(buyerElement, 'BuyerNr'),
                BuyerName: getElementText(buyerElement, 'BuyerName'),
            },
            CurrentCreditCoverDetails: {
                CurrentCreditCoverAmt: getElementNumber(currentCreditCoverDetailsElement, 'CurrentCreditCoverAmt'),
                Currency: getElementText(currentCreditCoverDetailsElement, 'Currency'),
            },
            NewCreditCoverDetails: {
                Request: getElementNumber(newCreditCoverDetailsElement, 'Request'),
                NewCreditCoverAmt: getElementNumber(newCreditCoverDetailsElement, 'NewCreditCoverAmt'),
                ValidFrom: getElementText(newCreditCoverDetailsElement, 'ValidFrom'),
                LongCreditPeriodDays: getElementNumber(newCreditCoverDetailsElement, 'LongCreditPeriodDays'),
            },
            OwnRiskNewCreditCover: root.querySelector('OwnRiskNewCreditCover') ? {} : null, // Empty if exists, null if not
            MsgText: getElementText(root, 'MsgText'),
        };
        // Create and return a new instance with the parsed data.
        return new MSG07(data);
    }

    /**
     * Getter for the current credit cover amount.
     * @returns {number} The current credit cover amount.
     */
    getCurrentCreditCoverAmount() {
        return this.currentCreditCoverDetails.CurrentCreditCoverAmt;
    }

    /**
     * Getter for the new credit cover amount.
     * @returns {number} The new credit cover amount.
     */
    getNewCreditCoverAmount() {
        return this.newCreditCoverDetails.NewCreditCoverAmt;
    }

    /**
     * Getter for the buyer's name.
     * @returns {string} The buyer's name.
     */
    getBuyerName() {
        return this.buyer.BuyerName;
    }
}


// script.js content (modified)
// This file contains the core client-side logic for the Credit Log application.
// It handles:
// 1. User interactions (file selection, button clicks).
// 2. Asynchronously reading and parsing uploaded XML files.
// 3. Processing and combining data from different message types (MSG01, MSG02, etc.).
// 4. Dynamically generating and displaying an HTML table with the results.
// 5. Providing functionality to copy the table data.

const fileInput = document.getElementById('fileInput');         // The <input type="file"> element.
const processButton = document.getElementById('processButton');   // The "Process Files" button.
const output = document.getElementById('output');                 // The <div> where the results table will be rendered.
let uploadedFiles = [];                                           // An array to hold the File objects selected by the user.

// Global collections to store the parsed message objects from all uploaded files.
const allMsg01s = new Map(); // Key: SenderCode_SellerNr, Value: MSG01 instance
const allMsg02s = [];
const allMsg05s = [];
const allMsg07s = [];

// Local cache for exchange rates entered by the user
const exchangeRatesCache = {};

// Handle the 'change' event on the file input element.
fileInput.addEventListener('change', (event) => {
    // When the user selects files, store them in the `uploadedFiles` array.
    uploadedFiles = Array.from(event.target.files);
    // Enable the "Process Files" button only if one or more files have been selected.
    if (uploadedFiles.length > 0) {
        processButton.disabled = false;
    }
});

// Main processing logic triggered by clicking the "Process Files" button.
// The function is `async` to allow for `await`ing the fetch request for exchange rates.
processButton.addEventListener('click', async () => {
    output.innerHTML = ''; // Clear previous output
    resetGlobalMessageCollections(); // Clear previous data
    clearExchangeRatesCache(); // Clear previous exchange rates

    // Initialize a counter to track when all files have been read.
    let filesReadCount = 0;
    const totalFilesToRead = uploadedFiles.length;

    // Iterate over each file the user selected.
    uploadedFiles.forEach((file) => {
        // Use FileReader to read the file content asynchronously.
        const reader = new FileReader();

        // The 'onload' event fires when the file has been successfully read.
        reader.onload = () => {
            // Read the file as an ArrayBuffer to handle character encoding correctly.
            const buffer = new Uint8Array(reader.result);
            // Decode a small initial chunk of the file to look for an XML encoding declaration.
            const chunk = buffer.subarray(0, 1024);
            const chunkAsString = new TextDecoder('latin1').decode(chunk);

            let encoding = 'utf-8';
            let encodingDeclared = false;
            const encodingMatch = chunkAsString.match(/<\?xml\s+.*?encoding\s*=\s*"(.*?)"/i);
            if (encodingMatch) {
                encoding = encodingMatch[1].toLowerCase();
                encodingDeclared = true;
            }

            let xmlString;
            // Attempt to decode the entire file into a string.
            try {
                // Use the detected encoding (or the 'utf-8' default). `fatal: true` ensures an error is thrown for invalid characters.
                xmlString = new TextDecoder(encoding, { fatal: true }).decode(buffer);
            } catch (e) {
                console.warn(`Failed to decode with primary encoding ('${encoding}'). Error:`, e);
                // If decoding fails and no encoding was declared, it's likely a legacy encoding.
                if (!encodingDeclared) {
                    // Try 'windows-1254' as a fallback, which is common for Turkish characters.
                    const fallbackEncoding = 'windows-1254';
                    try {
                        xmlString = new TextDecoder(fallbackEncoding).decode(buffer);
                    } catch (fallbackError) {
                        console.error(`Fallback to '${fallbackEncoding}' also failed. Decoding with lossy UTF-8 as a last resort.`, fallbackError);
                        // If all else fails, decode as UTF-8, which may result in replacement characters ().
                        xmlString = new TextDecoder('utf-8').decode(buffer);
                    }
                } else {
                    console.warn(`The declared encoding '${encoding}' seems incorrect. Falling back to lossy UTF-8.`);
                    xmlString = new TextDecoder('utf-8').decode(buffer);
                }
            }

            // Use the browser's built-in DOMParser to parse the XML string into a document object.
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(xmlString, 'application/xml');

            // Find all relevant message nodes within the parsed XML document.
            const msgNodes = xmlDoc.querySelectorAll('MSG01, MSG02, MSG05, MSG07');

            // Process each found message node.
            msgNodes.forEach(node => {
                try {
                    const nodeName = node.nodeName;
                    let instance;
                    // Based on the node name, create an instance of the corresponding class.
                    if (nodeName === 'MSG01') {
                        instance = MSG01.fromXMLString(node.outerHTML);
                        const key = `${instance.msgInfo.SenderCode}_${instance.seller.SellerNr}`;
                        allMsg01s.set(key, instance);
                    } else if (nodeName === 'MSG02') {
                        instance = MSG02.fromXMLString(node.outerHTML);
                        allMsg02s.push(instance);
                    } else if (nodeName === 'MSG05') {
                        instance = MSG05.fromXMLString(node.outerHTML);
                        allMsg05s.push(instance);
                    } else if (nodeName === 'MSG07') {
                        instance = MSG07.fromXMLString(node.outerHTML);
                        allMsg07s.push(instance);
                    }
                } catch (error) {
                    console.error(`Error parsing ${node.nodeName} from file ${file.name}:`, error.message);
                }
            });

            // Increment the counter for processed files.
            filesReadCount++;
            if (filesReadCount === totalFilesToRead) {
                // Once all files have been read and parsed, generate the combined data and display the table.
                // All files have been read, now combine and display
                const displayRows = generateCombinedDisplayData();
                displayTable(displayRows); // Removed exchangeRates parameter
            }
        };
        reader.readAsArrayBuffer(file);
    });
});

/**
 * Clears all data from the global message collections.
 * This is called at the beginning of processing to ensure no data from previous runs is carried over.
 */
function resetGlobalMessageCollections() {
    allMsg01s.clear();
    allMsg02s.length = 0;
    allMsg05s.length = 0;
    allMsg07s.length = 0;
}

/**
 * Clears the exchange rates cache.
 */
function clearExchangeRatesCache() {
    for (const key in exchangeRatesCache) {
        delete exchangeRatesCache[key];
    }
}

/**
 * Prompts the user to enter an exchange rate for a given currency.
 * @param {string} currencyCode - The 3-letter currency code (e.g., 'EUR', 'TRY').
 * @returns {number|null} The parsed exchange rate as a number, or null if invalid.
 */
function promptForExchangeRate(currencyCode) {
    let rate = null;
    let input = prompt(`Please enter the exchange rate for 1 USD to ${currencyCode.toUpperCase()} (e.g., if 1 USD = 0.92 EUR, enter 0.92):`);

    if (input === null) { // User cancelled
        return null;
    }

    rate = parseFloat(input);

    while (isNaN(rate) || rate <= 0) {
        input = prompt(`Invalid input. Please enter a positive number for the exchange rate for 1 USD to ${currencyCode.toUpperCase()}:`);
        if (input === null) {
            return null; // User cancelled again
        }
        rate = parseFloat(input);
    }
    return rate;
}


/**
 * Generates an array of row objects ready for display.
 * It iterates through transactional messages (02, 05, 07), combines them with
 * their corresponding seller info message (01), and structures the data for the table.
 * @returns {Array<object>} An array of objects, where each object represents a row in the final table.
 */
function generateCombinedDisplayData() {
    const combinedData = [];

    // Combine all transactional messages into a single array to iterate over.
    [...allMsg02s, ...allMsg05s, ...allMsg07s].forEach(msg => {
        const msgType = msg.type;
        // Create a unique key based on the sender and seller number to find the matching MSG01.
        const key = `${msg.msgInfo.SenderCode}_${msg.seller.SellerNr}`;
        const matchedMsg01 = allMsg01s.get(key);

        // Create a structured 'row' object with default/empty values.
        let row = {
            sequenceNr: msg.msgInfo.SequenceNr ? msg.msgInfo.SequenceNr : '',
            requestDate: '',
            dateReceived: msg.msgInfo.DateTime ? msg.msgInfo.DateTime.slice(0, 10) : '',
            reminder: 'No',
            newAcctNameAddressChange: 'No',
            cancellation: 'No',
            buyerName: msg.buyer ? msg.buyer.BuyerName : '',
            buyerCountry: msg.buyer ? msg.buyer.Country || '' : '', // MSG07 might not have Country
            sellerName: msg.seller ? msg.seller.SellerName : '',
            sellerCountry: '', // To be inferred
            partnerName: msg.ef ? msg.ef.FactorName : '',
            partnerCountry: '', // To be inferred
            messageType: msgType.slice(-1), // '2', '5', '7'
            amountReq: '',
            currency: '',
            term: '',
            contactAllowed: 'No',
            msgFunctionCode: '', // 3, 6, 8
            amtApproved: '',
            msg3ExpirationDate: '',
            insurance: '',
            responseDate: '',
            ofacDate: '',
            rate: '',
            incomingComments: msg.msgText || '',
            creditComments: '',
            aeComments: '',
            daysToRespond: '',
            creditManager: '', // To be calculated
            aeCso: '',
            industryProduct: '', // From MSG01
            clientCode: msg.ef ? msg.ef.FactorCode : '',
            amountReqUSD: '' // To be calculated
        };

        // Populate fields that vary based on the message type (Amount, Currency, Term, etc.).
        if (msgType === 'MSG02') {
            row.requestDate = msg.requestDate || '';
            row.amountReq = msg.prelCreditAssessDetails ? msg.prelCreditAssessDetails.AmtCreditAssessReq : '';
            row.currency = msg.prelCreditAssessDetails ? msg.prelCreditAssessDetails.Currency : '';
            row.term = msg.prelCreditAssessDetails ? msg.prelCreditAssessDetails.NetPmtTerms : '';
            row.contactAllowed = (msg.buyer && msg.buyer.DirectContact == 1) ? 'Yes' : 'No';
        } else if (msgType === 'MSG05') {
            row.requestDate = msg.requestDate || '';
            row.amountReq = msg.creditCoverDetails ? msg.creditCoverDetails.NewCreditCoverAmt : '';
            row.currency = msg.creditCoverDetails ? msg.creditCoverDetails.Currency : '';
            row.term = msg.creditCoverDetails ? msg.creditCoverDetails.NetPmtTerms : '';
            row.contactAllowed = (msg.buyer && msg.buyer.DirectContact == 1) ? 'Yes' : 'No';
        } else if (msgType === 'MSG07') {
            row.requestDate = msg.requestDate || '';
            row.amountReq = msg.newCreditCoverDetails ? msg.newCreditCoverDetails.NewCreditCoverAmt : '';
            row.currency = msg.currentCreditCoverDetails ? msg.currentCreditCoverDetails.Currency : '';
            row.term = msg.newCreditCoverDetails ? msg.newCreditCoverDetails.LongCreditPeriodDays : '';
            // MSG07 buyer doesn't have DirectContact
        }

        // If a matching MSG01 was found, populate the row with its data.
        if (matchedMsg01) {
            row.industryProduct = matchedMsg01.sellerDetails ? matchedMsg01.sellerDetails.BusinessProduct : '';
            // If MSG01 MsgDate is relevant for Request Date when the paired msg doesn't have it, uncomment below
            // if (!row.requestDate) {
            //     row.requestDate = matchedMsg01.msgDate || '';
            // }
        }

        // Infer country names from the 2-letter country codes in the FactorCode.
        const regionNames = new Intl.DisplayNames(['en'], { type: 'region' });
        const exportFactorCodeCharacters = msg.ef ? msg.ef.FactorCode.substring(0, 2) : '';
        row.partnerCountry = exportFactorCodeCharacters ? regionNames.of(exportFactorCodeCharacters) : '';
        row.sellerCountry = row.partnerCountry; // Assuming seller country is same as export factor country based on current script's logic

        // Calculate the USD equivalent for the requested amount.
        row.amountReqUSD = convertToUSD(row.amountReq, row.currency); // Removed exchangeRates parameter
        console.log(row.amountReqUSD);

        // Determine the assigned credit manager based on business rules.
        row.creditManager = getCreditManager(exportFactorCodeCharacters, row.amountReqUSD, row.partnerName);
        row.aeCso = getAccountExecutive(exportFactorCodeCharacters, row.partnerName);

        //row.aeComments = getAccountExecutive(row.countryCode, row.factorName);
        combinedData.push(row);
    });

    // Sort the final data by the date the message was received for a chronological view.
    combinedData.sort((a, b) => new Date(a.dateReceived) - new Date(b.dateReceived));

    return combinedData;
}

/**
 * Renders the final HTML table from the processed data rows.
 * @param {Array<object>} displayRows - An array of row objects from `generateCombinedDisplayData`.
 */
function displayTable(displayRows) { // Removed exchangeRates parameter
    // Start building the table HTML with the header row.
    let tableHTML = `<table border="1"><tr>
        <th>Sequence Number</th>
        <th>Request Date</th>
        <th>Date Received</th>
        <th>Reminder (Yes/No)</th>
        <th>New Acct / Name Address Change (Yes/No)</th>
        <th>Cancellation (Yes/No)</th>
        <th>Buyer</th>
        <th>Buyer Country</th>
        <th>Seller</th>
        <th>Seller Country</th>
        <th>Partner</th>
        <th>Partner Country</th>
        <th>2,5,7</th>
        <th>Amount Req</th>
        <th>Currency</th>
        <th>Term</th>
        <th>Contact Allowed (Yes/No)</th>
        <th>3, 6, 8</th>
        <th>Amt Appr</th>
        <th>Msg 3 Expiration Date</th>
        <th>Insurance (Yes/No)</th>
        <th>Response Date</th>
        <th>OFAC Date</th>
        <th>Rate</th>
        <th>Incoming Comments</th>
        <th>Credit Comments</th>
        <th>AE Comments</th>
        <th># Days to Respond</th>
        <th>Credit Manager</th>
        <th>AE/CSO</th>
        <th>Industry / Product</th>
        <th>Client Code</th>
    </tr>`;
    //<th>Amount Req (USD)</th>

    // Iterate over each processed row object to create a <tr> element.
    displayRows.forEach(row => {

        // Find today's date:
        var today = new Date();
        today = String(today.getMonth() + 1).padStart(2, '0') + '-' + String(today.getDate()).padStart(2, '0') + '-' + today.getFullYear();

        // Append the new table row with all its data cells (<td>).
        //console.log(row.SequenceNr);
        tableHTML += `<tr>
            <td>${row.sequenceNr}</td>
            <td>${row.requestDate}</td>
            <td>${today}</td>
            <td>${row.reminder}</td>
            <td>${row.newAcctNameAddressChange}</td>
            <td>${row.cancellation}</td>
            <td>${row.buyerName}</td>
            <td>${row.buyerCountry}</td>
            <td>${row.sellerName}</td>
            <td>${row.sellerCountry}</td>
            <td>${row.partnerName}</td>
            <td>${row.partnerCountry}</td>
            <td>${row.messageType}</td>
            <td>${row.amountReq}</td>
            <td>${row.currency}</td>
            <td>${row.term}</td>
            <td>${row.contactAllowed}</td>
            <td>${row.msgFunctionCode}</td>
            <td>${row.amtApproved}</td>
            <td>${row.msg3ExpirationDate}</td>
            <td>${row.insurance}</td>
            <td>${row.responseDate}</td>
            <td>${row.ofacDate}</td>
            <td>${row.rate}</td>
            <td>${row.incomingComments}</td>
            <td>${row.creditComments}</td>
            <td>${row.aeComments}</td>
            <td>${row.daysToRespond}</td>
            <td>${row.creditManager}</td>
            <td>${row.aeCso}</td>
            <td>${row.industryProduct}</td>
            <td>${row.clientCode}</td>
            
        </tr>`;
        //<td>${typeof row.amountReqUSD === 'number' ? row.amountReqUSD.toFixed(2) : row.amountReqUSD}</td>
    });

    // Close the table tag and set the innerHTML of the output div.
    tableHTML += '</table>';
    output.innerHTML = tableHTML;
    console.log("All files processed. Table output updated.");
    // Now that the table exists, enable the "Copy as TSV" buttons.
    if (copyTSVWithHeader) copyTSVWithHeader.disabled = false;
    if (copyTSVNoHeader) copyTSVNoHeader.disabled = false;
}

/**
 * Converts an amount from a given currency to USD using prompted exchange rates.
 * @param {string|number} amount - The amount to convert.
 * @param {string} currency - The currency code of the amount (e.g., 'EUR', 'TRY').
 * @returns {string} A formatted string representing the amount in USD or an error/status message.
 */
function convertToUSD(amount, currency) { // Removed rates parameter
    if (amount == null || amount === '') return ' ';
    if (currency == null || currency === '') return 'N/A';

    // Ensure the amount is a valid number.
    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount)) return 'Invalid Amount';

    const upperCaseCurrency = currency.toUpperCase();

    // If the currency is already USD, just format and return it.
    if (upperCaseCurrency === 'USD') {
        return numericAmount; // Return as number for calculation
    }

    let rate = exchangeRatesCache[upperCaseCurrency];

    if (!rate) {
        // Prompt user for the rate if not in cache
        rate = promptForExchangeRate(upperCaseCurrency);
        if (rate !== null) {
            exchangeRatesCache[upperCaseCurrency] = rate; // Store in cache
        } else {
            console.warn(`User cancelled exchange rate input for ${upperCaseCurrency}.`);
            return `${numericAmount.toFixed(2)} ${upperCaseCurrency} (Rate needed)`;
        }
    }

    if (!rate) { // This can happen if promptForExchangeRate returns null
        console.warn(`Exchange rate for ${upperCaseCurrency} not available.`);
        return `${numericAmount.toFixed(2)} ${upperCaseCurrency} (No Rate)`;
    }

    // Perform the conversion (rates are relative to 1 USD, so amount / rate)
    const amountInUSD = numericAmount / rate;
    return amountInUSD; // Return as number for calculation
}

/**
 * Determines the responsible credit manager based on a set of business rules.
 * @param {string} countryCode - The two-letter country code of the partner.
 * @param {string|number} creditLine - The requested credit amount.
 * @param {string} factorName - The name of the factoring partner.
 * @returns {string} The name of the assigned credit manager ('lux', 'trey', or 'bost').
 */
function getCreditManager(countryCode, creditLine, factorName) {

    

    const numericCreditLine = parseFloat(creditLine);
    if (isNaN(numericCreditLine)) return "N/A"; // Handle invalid credit line

    // Rule 1: Based on credit line amount.
    if (numericCreditLine <= 500000) {
        return "lux";
    } else {
        // Rule 2: Based on country code and specific partner names.
        const treyCountryCodes = ['AM', 'EG', 'GR', 'IN', 'MT', 'RO', 'TW', 'TR', 'VN'];
        const treySpecialCodes = ['SG', 'JP', 'US'];
        if (treyCountryCodes.includes(countryCode)) {
            return "trey";
        } else if (treySpecialCodes.includes(countryCode)) {
            if (countryCode === 'SG' && factorName.includes("Mogli")) {
                return "trey";
            } else if (countryCode === 'JP' && (factorName.includes("Mitsubishi") || factorName.includes("Sumitomo Mitsui"))) {
                return "trey";
            } else if (countryCode === 'US' && factorName.includes("Standard Chartered Bank New York")) {
                return "trey";
            }
        }
    }
    // Default assignment.
    return "bost";
}

/**
 * Determines the responsible Account Executive based on a set of business rules.
 * @param {string} countryCode - The two-letter country code of the partner.
 * @param {string} factorName - The name of the factoring partner.
 * @returns {string} The name of the assigned Account Executive ('Mary', 'Tammie', 'James', 'Tyler', 'Trey', or 'N/A - No AE Found').
 */
function getAccountExecutive(countryCode, factorName) {

    console.log(`getCreditManager called with countryCode: ${countryCode}, factorName: ${factorName}`);

    // Convert both factorName and countryCode to uppercase for consistent, case-insensitive comparisons
    const factorNameUpper = String(factorName).toUpperCase();
    const countryCodeUpper = String(countryCode).toUpperCase();

    const maryCodes = ['AR', 'BD', 'CA', 'CL', 'CN', 'DO', 'SV', 'GT', 'HN', 'HK', 'HU', 'IT', 'MU', 'PK', 'PT', 'UY'];
    const tammieCodes = ['AM', 'BG', 'HR', 'CY', 'CZ', 'EG', 'GR', 'MT', 'MA', 'RS', 'SK', 'SI', 'TN', 'TR'];
    const jamesCodes = ['ID', 'JP', 'KP', 'KR', 'MY', 'PL', 'ES', 'LK', 'TH', 'AE', 'VN'];
    const tylerCodes = ['BR', 'CO', 'CR', 'FR', 'DE', 'MD', 'PE', 'RO', 'TW'];

    // If Country is Mexico
    if (countryCodeUpper === 'MX') {
        if (factorNameUpper.includes('BANCOMEX')) {
            return "Mary Farley";
        } else if (factorNameUpper.includes('BANCO MONEX')) {
            return "Tyler Sigler";
        }
    }

    // If Country is India
    if (countryCodeUpper === 'IN') {
        if (factorNameUpper.includes('INDIA FACTORING') || factorNameUpper.includes('SBI GLOBAL')) {
            return "Tammie Cosey";
        } else if (factorNameUpper.includes('ICICI BANK') || factorNameUpper.includes('INDIA EXIM')) {
            return "James Vuu";
        } else if (factorNameUpper.includes('ECGC') || factorNameUpper.includes('YES BANK')) {
            return "Tyler Sigler";
        }
    }

    // If Country is USA and factor name contains "Standard Chartered Bank New York"
    if (countryCodeUpper === 'US' && factorNameUpper.includes('STANDARD CHARTERED BANK NEW YORK')) {
        return "Mary Farley";
    }

    // If Country is Singapore
    if (countryCodeUpper === 'SG') {
        if (factorNameUpper.includes('MOGLI LABS')) {
            return "Tammie Cosey";
        } else {
            return "James Vuu";
        }
    }

    // General rules that can apply to any country, based on factorName
    if (factorNameUpper.includes('SKYTEX') || factorNameUpper.includes('GLOBAL DENIM')) {
        return "Mary Farley";
    }

    // General country code lists
    if (maryCodes.includes(countryCodeUpper)) {
        return "Mary Farley";
    } else if (tammieCodes.includes(countryCodeUpper)) {
        return "Tammie Cosey";
    } else if (jamesCodes.includes(countryCodeUpper)) {
        return "James Vuu";
    } else if (tylerCodes.includes(countryCodeUpper)) {
        return "Tyler Sigler";
    }

    // Fallback if no specific rule matches
    return " ";
}

// Get references to the "Copy as TSV" buttons.
const copyTSVWithHeader = document.getElementById('copyTSVWithHeader');
const copyTSVNoHeader = document.getElementById('copyTSVNoHeader');

/**
 * Copies the content of the generated table to the clipboard in Tab-Separated Values (TSV) format.
 * @param {boolean} [includeHeader=true] - Whether to include the table's header row in the copied data.
 */
function copyTableAsTSV(includeHeader = true) {
    const table = output.querySelector('table');
    if (!table) return;

    // Initialize the TSV string.
    let tsv = '';
    // Determine the starting row based on whether the header should be included.
    let startRow = 0;
    if (!includeHeader) startRow = 1;

    // Iterate over the table rows.
    for (let i = startRow; i < table.rows.length; i++) {
        let rowData = [];
        // Collect the text from each cell in the current row.
        for (let cell of table.rows[i].cells) {
            // Sanitize text to remove tabs and newlines which would break the TSV format.
            let text = cell.innerText.replace(/\t/g, ' ').replace(/\n/g, ' ');
            rowData.push(text);
        }
        tsv += rowData.join('\t') + '\n';
    }
    // Use the modern Clipboard API to write the TSV string.
    navigator.clipboard.writeText(tsv).then(() => {
        if (includeHeader) {
            copyTSVWithHeader.textContent = 'Copied!';
            setTimeout(() => { copyTSVWithHeader.textContent = 'Copy Table as TSV (with header)'; }, 1500);
        } else {
            copyTSVNoHeader.textContent = 'Copied!';
            setTimeout(() => { copyTSVNoHeader.textContent = 'Copy Table as TSV (no header)'; }, 1500);
        }
    });
}

// Attach the copy function to the click events of the buttons.
if (copyTSVWithHeader) {
    copyTSVWithHeader.disabled = true;
    copyTSVWithHeader.addEventListener('click', () => copyTableAsTSV(true));
}
if (copyTSVNoHeader) {
    copyTSVNoHeader.disabled = true;
    copyTSVNoHeader.addEventListener('click', () => copyTableAsTSV(false));
}