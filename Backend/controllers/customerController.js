/**
 * Customer records.
 *
 * Derived from consultations rather than stored separately: a client only ever
 * exists because they booked, so a second collection would be a duplicate
 * source of truth that drifts. Grouping is on a normalised contact — lowercased
 * for emails, digits-only for phones — so "+91 91191 38356" and "9119138356"
 * resolve to the same person.
 */

const Consultation = require('../models/Consultation');

/** Normalise a contact into a stable grouping key. */
function keyFor(contact) {
  const raw = String(contact || '').trim();
  if (!raw) return '';
  if (raw.includes('@')) return raw.toLowerCase();
  const digits = raw.replace(/\D/g, '');
  // Compare on the last 10 digits so a country code does not split a person.
  return digits.length > 10 ? digits.slice(-10) : digits;
}

function buildCustomers(consultations) {
  const map = new Map();

  for (const c of consultations) {
    const key = keyFor(c.contact);
    if (!key) continue;

    if (!map.has(key)) {
      map.set(key, {
        key,
        name: c.name,
        contact: c.contact,
        contactType: c.contactType,
        totalBookings: 0,
        totalSpend: 0,
        statuses: {},
        areas: new Set(),
        firstSeen: c.createdAt,
        lastSeen: c.createdAt,
        history: []
      });
    }

    const cust = map.get(key);
    cust.totalBookings += 1;
    if (c.paymentStatus === 'paid') cust.totalSpend += c.amount || 0;
    cust.statuses[c.status] = (cust.statuses[c.status] || 0) + 1;
    if (c.area) cust.areas.add(c.area);
    if (new Date(c.createdAt) < new Date(cust.firstSeen)) cust.firstSeen = c.createdAt;
    if (new Date(c.createdAt) > new Date(cust.lastSeen)) {
      cust.lastSeen = c.createdAt;
      // Keep the most recent name and contact spelling.
      cust.name = c.name;
      cust.contact = c.contact;
    }
    cust.history.push({
      _id: c._id,
      area: c.area,
      status: c.status,
      paymentStatus: c.paymentStatus,
      amount: c.amount,
      appointmentDate: c.appointmentDate,
      appointmentTime: c.appointmentTime,
      dob: c.dob,
      tob: c.tob,
      pob: c.pob,
      createdAt: c.createdAt
    });
  }

  return [...map.values()]
    .map((c) => ({ ...c, areas: [...c.areas], history: c.history.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)) }))
    .sort((a, b) => new Date(b.lastSeen) - new Date(a.lastSeen));
}

/** GET /api/customers — admin. */
const getCustomers = async (req, res) => {
  try {
    const { search } = req.query;
    const consultations = await Consultation.find({}).sort({ createdAt: -1 }).lean();
    let customers = buildCustomers(consultations);

    if (search) {
      const q = String(search).toLowerCase();
      customers = customers.filter((c) =>
        c.name.toLowerCase().includes(q) ||
        c.contact.toLowerCase().includes(q) ||
        c.areas.some((a) => a.toLowerCase().includes(q))
      );
    }

    res.json({
      success: true,
      count: customers.length,
      totals: {
        customers: customers.length,
        repeat: customers.filter((c) => c.totalBookings > 1).length,
        revenue: customers.reduce((s, c) => s + c.totalSpend, 0)
      },
      data: customers
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getCustomers, keyFor };
