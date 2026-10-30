const db = require("../config/db");
const { sendNotificationMessage } = require("../services/otpDeliveryService");

const categoryPriorityMap = {
  food: "high",
  clothes: "medium",
  stationary: "low",
  household: "medium",
};

const parseDonationPhotos = (rawValue) => {
  if (!rawValue) {
    return [];
  }

  try {
    const parsedValue = JSON.parse(rawValue);
    return Array.isArray(parsedValue) ? parsedValue.filter(Boolean) : [];
  } catch (_error) {
    return [];
  }
};

const parseCategoriesAccepted = (rawValue) => {
  if (!rawValue) {
    return [];
  }

  try {
    const parsedValue = JSON.parse(rawValue);
    return Array.isArray(parsedValue) ? parsedValue.filter(Boolean) : [];
  } catch (_error) {
    return [];
  }
};

const titleCase = (value) =>
  String(value || "")
    .split("-")
    .filter(Boolean)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(" ");

const buildItemsSummary = (items = []) =>
  items
    .map((item) => {
      const quantityParts = [item.data?.quantity, item.data?.unit].filter(Boolean).join(" ");
      return quantityParts ? `${item.data?.name} (${quantityParts})` : item.data?.name;
    })
    .filter(Boolean)
    .join(", ");

const buildDonationContext = (donation) => ({
  category: titleCase(donation.category),
  ngoName: donation.ngo?.name || "the assigned NGO",
  pickupArea: [donation.pickup.city, donation.pickup.state].filter(Boolean).join(", ") || "your area",
  pickupAddress:
    [
      donation.pickup.address,
      donation.pickup.landmark,
      donation.pickup.city,
      donation.pickup.state,
      donation.pickup.pincode,
    ]
      .filter(Boolean)
      .join(", ") || "the saved pickup address",
  pickupDate: donation.pickup.preferredDate || "the selected date",
  pickupTime: donation.pickup.preferredTime || "the selected time slot",
  itemsSummary: buildItemsSummary(donation.items) || `${titleCase(donation.category)} donation items`,
});

const sendUserNotification = async (user, payload) => {
  if (!user || (!user.email && !user.phone)) {
    return;
  }

  await sendNotificationMessage({
    email: user.email || "",
    phone: user.phone || "",
    ...payload,
  });
};

const runInBackground = (label, task) => {
  Promise.resolve()
    .then(task)
    .catch((error) => {
      console.error(`${label} error:`, error);
    });
};

const notifyDonor = async (donation, user, eventName) => {
  const context = buildDonationContext(donation);
    const baseStyle = `
    font-family: Arial, sans-serif;
    font-size: 15px;
    line-height: 1.6;
    color: #333;
  `;

  const cardStyle = `
    max-width: 600px;
    margin: auto;
    padding: 20px;
    border: 1px solid #eee;
    border-radius: 10px;
    background-color: #fafafa;
  `;

  const header = `
    <h2 style="color:#2c7be5; margin-bottom:10px;">KindKart</h2>
  `;

  const footer = `
    <hr style="margin-top:20px"/>
    <p style="font-size:12px;color:#777;">
      Thank you for being a part of KindKart ❤️ <br/>
      Together, we make a difference.
    </p>
  `;

    const messages = {
    created: {
      subject: "🎉 Your donation is live on KindKart!",
      text:
        `Hi ${user.name}, your ${context.category.toLowerCase()} donation has been successfully created. ` +
        `Pickup area: ${context.pickupArea}. Items: ${context.itemsSummary}.`,
      html: `
        <div style="${baseStyle}">
          <div style="${cardStyle}">
            ${header}
            <h3>🎉 Donation Created Successfully!</h3>
            <p>Hi <strong>${user.name}</strong>,</p>
            <p>Your donation is now live and visible to NGOs on KindKart.</p>

            <h4>📦 Donation Details</h4>
            <p><strong>Category:</strong> ${context.category}</p>
            <p><strong>Pickup Area:</strong> ${context.pickupArea}</p>
            <p><strong>Items:</strong> ${context.itemsSummary}</p>

            <p>⏳ NGOs will review and accept your donation soon.</p>

            ${footer}
          </div>
        </div>
      `,
    },

    accepted: {
      subject: "✅ Your donation has been accepted!",
      text:
        `${context.ngoName} accepted your donation. Pickup at ${context.pickupAddress} on ${context.pickupDate}, ${context.pickupTime}.`,
      html: `
        <div style="${baseStyle}">
          <div style="${cardStyle}">
            ${header}
            <h3>✅ Donation Accepted</h3>
            <p>Great news <strong>${user.name}</strong>!</p>
            <p><strong>${context.ngoName}</strong> has accepted your donation.</p>

            <h4>🚚 Pickup Details</h4>
            <p><strong>Address:</strong> ${context.pickupAddress}</p>
            <p><strong>Date:</strong> ${context.pickupDate}</p>
            <p><strong>Time:</strong> ${context.pickupTime}</p>

            <p>Please ensure availability during the scheduled time.</p>

            ${footer}
          </div>
        </div>
      `,
    },

    pickedUp: {
      subject: "🚚 Your donation has been picked up!",
      text:
        `${context.ngoName} has picked up your donation (${context.itemsSummary}).`,
      html: `
        <div style="${baseStyle}">
          <div style="${cardStyle}">
            ${header}
            <h3>🚚 Pickup Completed</h3>
            <p>Hi <strong>${user.name}</strong>,</p>
            <p>Your donation has been successfully collected by <strong>${context.ngoName}</strong>.</p>

            <h4>📦 Items Collected</h4>
            <p>${context.itemsSummary}</p>

            <p>Thank you for your contribution 🙌</p>

            ${footer}
          </div>
        </div>
      `,
    },

    completed: {
      subject: "❤️ Thank you for your donation!",
      text:
        `Your donation has been completed. Thank you for donating ${context.itemsSummary}.`,
      html: `
        <div style="${baseStyle}">
          <div style="${cardStyle}">
            ${header}
            <h3>❤️ Donation Completed</h3>
            <p>Hi <strong>${user.name}</strong>,</p>
            <p>Your donation process has been successfully completed by <strong>${context.ngoName}</strong>.</p>

            <h4>🌟 Your Impact</h4>
            <p>You donated: ${context.itemsSummary}</p>

            <p>Your small act of kindness can make a big difference in someone's life.</p>

            ${footer}
          </div>
        </div>
      `,
    },
  };

  const payload = messages[eventName];
  if (payload) {
    await sendUserNotification(user, payload);
  }
};

const notifyNearbyNgos = async (donation, donor) => {
  const donationPincode = String(donation.pickup.pincode || "").trim();
  const donationCity = String(donation.pickup.city || "").trim().toLowerCase();
  const donationCategory = String(donation.category || "").trim().toLowerCase();

  const ngoRows = await db.queryAsync(
    `
      SELECT id, name, email, phone, service_city, service_pincode, categories_accepted
      FROM users
      WHERE role = 'ngo' AND ngo_verification_status = 'approved'
    `
  );

  const matchingNgos = ngoRows.filter((ngo) => {
    const ngoCity = String(ngo.service_city || "").trim().toLowerCase();
    const ngoPincodes = String(ngo.service_pincode || "")
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean);
    const acceptedCategories = parseCategoriesAccepted(ngo.categories_accepted).map((value) =>
      String(value).trim().toLowerCase()
    );

    const matchesLocation =
      (donationPincode && ngoPincodes.includes(donationPincode)) ||
      (donationCity && ngoCity && ngoCity === donationCity);
    const matchesCategory =
      acceptedCategories.length === 0 || acceptedCategories.includes(donationCategory);

    return matchesLocation && matchesCategory;
  });

  const context = buildDonationContext(donation);
  const donorName = donor?.name || "A donor";
  const baseStyle = `
  font-family: Arial, sans-serif;
  font-size: 15px;
  line-height: 1.6;
  color: #333;
`;

const cardStyle = `
  max-width: 600px;
  margin: auto;
  padding: 20px;
  border: 1px solid #eee;
  border-radius: 10px;
  background-color: #fafafa;
`;

const footer = `
  <hr style="margin-top:20px"/>
  <p style="font-size:12px;color:#777;">
    KindKart NGO Network • Helping communities together 🤝
  </p>
`;

  await Promise.all(
    matchingNgos.map((ngo) =>
      sendUserNotification(ngo, {
         subject: "🚨 New Nearby Donation Available!",
        text:
          `${donorName} posted a ${context.category.toLowerCase()} donation near ${context.pickupArea}. ` +
          `Items: ${context.itemsSummary}. Log in to accept this donation.`,

        html: `
          <div style="${baseStyle}">
            <div style="${cardStyle}">
              <h2 style="color:#2c7be5;">KindKart</h2>

              <h3>🚨 New Donation Alert</h3>

              <p>Hello <strong>${ngo.name}</strong>,</p>

              <p>A new donation matching your service area is available.</p>

              <h4>📍 Donation Details</h4>
              <p><strong>Donor:</strong> ${donorName}</p>
              <p><strong>Category:</strong> ${context.category}</p>
              <p><strong>Location:</strong> ${context.pickupArea}</p>
              <p><strong>Items:</strong> ${context.itemsSummary}</p>

              <p style="margin-top:15px;">
                ⚡ <strong>Act fast!</strong> Donations are accepted on a first-come basis.
              </p>

              <div style="margin:20px 0;">
                <a href="${process.env.APP_URL || "http://localhost:3000"}/ngo/dashboard"
                  style="
                    background-color:#2c7be5;
                    color:white;
                    padding:10px 15px;
                    text-decoration:none;
                    border-radius:5px;
                    display:inline-block;
                  ">
                  View & Accept Donation
                </a>
              </div>

              ${footer}
            </div>
          </div>
        `,
      })
    )
  );
};

const groupDonationRows = (rows) => {
  const donationsMap = new Map();

  rows.forEach((row) => {
    if (!donationsMap.has(row.id)) {
      donationsMap.set(row.id, {
        id: String(row.id),
        status: row.status,
        date: row.created_at,
        assignedAt: row.assigned_at || null,
        completedAt: row.completed_at || null,
        donorRating: row.donor_rating !== null && row.donor_rating !== undefined ? Number(row.donor_rating) : null,
        donorRatingAt: row.donor_rating_at || null,
        category: row.category || "household",
        photos: parseDonationPhotos(row.donation_photos),
        donor: {
          id: row.donor_id ? String(row.donor_id) : "",
          name: row.donor_name || "Anonymous",
          phone: row.donor_phone || "",
          email: row.donor_email || "",
          anonymous: false,
        },
        ngo: row.ngo_id
          ? {
              id: String(row.ngo_id),
              name: row.ngo_name || "",
              phone: row.ngo_phone || "",
              email: row.ngo_email || "",
            }
          : null,
        pickup: {
          address: row.address || "",
          city: row.city || "",
          state: row.state || "",
          pincode: row.pincode || "",
          landmark: row.landmark || "",
          placeId: row.place_id || "",
          latitude: row.latitude !== null && row.latitude !== undefined ? Number(row.latitude) : null,
          longitude: row.longitude !== null && row.longitude !== undefined ? Number(row.longitude) : null,
          preferredDate: row.pickup_date || "",
          preferredTime: row.time_slot || "",
        },
        location: {
          city: row.city || "",
          state: row.state || "",
          latitude: row.latitude !== null && row.latitude !== undefined ? Number(row.latitude) : null,
          longitude: row.longitude !== null && row.longitude !== undefined ? Number(row.longitude) : null,
        },
        items: [],
      });
    }

    if (row.item_name) {
      const donation = donationsMap.get(row.id);
      donation.items.push({
        category: row.category || donation.category,
        data: {
          name: row.item_name,
          quantity: row.quantity,
          unit: row.unit || "",
          condition: row.item_condition || row.food_condition || "",
        },
      });
    }
  });

  return Array.from(donationsMap.values()).map((donation) => ({
    ...donation,
    category: donation.category || donation.items[0]?.category || "household",
    priority:
      categoryPriorityMap[donation.category || donation.items[0]?.category || "household"] || "medium",
    aiMatch:
      donation.category === "food"
        ? 96
        : donation.category === "clothes"
          ? 88
          : donation.category === "household"
            ? 84
            : 76,
  }));
};

const fetchDonations = async (whereClause, params) => {
  const rows = await db.queryAsync(
    `
      SELECT
        d.id,
        d.donor_id,
        d.ngo_id,
        d.status,
        d.created_at,
        d.assigned_at,
        d.completed_at,
        d.donor_rating,
        d.donor_rating_at,
        d.donation_photos,
        donor.name AS donor_name,
        donor.phone AS donor_phone,
        donor.email AS donor_email,
        ngo.name AS ngo_name,
        ngo.phone AS ngo_phone,
        ngo.email AS ngo_email,
        p.address,
        p.city,
        p.state,
        p.pincode,
        p.landmark,
        p.place_id,
        p.latitude,
        p.longitude,
        p.pickup_date,
        p.time_slot,
        di.category,
        di.item_name,
        di.quantity,
        di.unit,
        di.item_condition,
        di.food_condition
      FROM donations d
      LEFT JOIN users donor ON donor.id = d.donor_id
      LEFT JOIN users ngo ON ngo.id = d.ngo_id
      LEFT JOIN pickups p ON p.donation_id = d.id
      LEFT JOIN donation_items di ON di.donation_id = d.id
      ${whereClause}
      ORDER BY d.created_at DESC, di.id ASC
    `,
    params
  );

  return groupDonationRows(rows);
};

const fetchDonationById = async (donationId) => {
  const donations = await fetchDonations("WHERE d.id = ?", [donationId]);
  return donations[0] || null;
};

exports.createDonation = async (req, res) => {
  const donorId = req.user.id;
  const { pickup, items, photos } = req.body;

  if (!pickup || !items || items.length === 0) {
    return res.status(400).json({ message: "Pickup details or items missing" });
  }

  const donationPhotos = Array.isArray(photos) ? photos.filter(Boolean).slice(0, 3) : [];

  try {
    const donationResult = await db.queryAsync(
      "INSERT INTO donations (donor_id, donation_photos, status) VALUES (?, ?, ?)",
      [donorId, JSON.stringify(donationPhotos), "pending"]
    );

    const donationId = donationResult.insertId;

    await db.queryAsync(
      `
        INSERT INTO pickups
        (donation_id, address, city, state, pincode, landmark, place_id, latitude, longitude, pickup_date, time_slot)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        donationId,
        pickup.address || null,
        pickup.city || null,
        pickup.state || null,
        pickup.pincode || null,
        pickup.landmark || null,
        pickup.placeId || null,
        pickup.latitude ?? null,
        pickup.longitude ?? null,
        pickup.preferredDate || null,
        pickup.preferredTime || null,
      ]
    );

    const insertItemTasks = [];

    for (const categoryItem of items) {
      const data = categoryItem.data || {};
      const itemList = Array.isArray(data.items) ? data.items : [];

      for (const item of itemList) {
        if (!item.name || !item.quantity) {
          continue;
        }

        insertItemTasks.push(
          db.queryAsync(
            `
              INSERT INTO donation_items
              (donation_id, category, item_name, quantity, unit, item_condition, food_type, food_condition, prepared_time, expiry_time)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `,
            [
              donationId,
              categoryItem.category || null,
              item.name,
              item.quantity,
              item.unit || null,
              item.condition || null,
              data.foodType || null,
              data.condition || null,
              data.preparedTime || null,
              data.expiryTime || null,
            ]
          )
        );
      }
    }

    await Promise.all(insertItemTasks);

    res.status(201).json({
      message: "Donation created successfully",
      donationId,
    });

    runInBackground("Donation notification", async () => {
      const createdDonation = await fetchDonationById(donationId);

      if (!createdDonation) {
        return;
      }

      await Promise.all([
        notifyDonor(createdDonation, createdDonation.donor, "created"),
        notifyNearbyNgos(createdDonation, createdDonation.donor),
      ]);
    });
  } catch (error) {
    console.error("Create donation error:", error);
    res.status(500).json({ message: "Failed to create donation" });
  }
};

exports.getMyDonations = async (req, res) => {
  try {
    const donations = await fetchDonations("WHERE d.donor_id = ?", [req.user.id]);

    res.json(
      donations.map((donation) => ({
        id: donation.id,
        status: donation.status,
        date: donation.date,
        photos: donation.photos,
        pickup: donation.pickup,
        ngo: donation.ngo,
        donorRating: donation.donorRating,
        donorRatingAt: donation.donorRatingAt,
        items: donation.items.map((item) => ({
          category: item.data.name,
          data: {
            quantity: item.data.quantity,
            unit: item.data.unit,
          },
        })),
      }))
    );
  } catch (error) {
    console.error("Fetch donations error:", error);
    res.status(500).json({ message: "Error fetching donations" });
  }
};

exports.getAvailableDonations = async (_req, res) => {
  try {
    const donations = await fetchDonations("WHERE d.status = 'pending' AND d.ngo_id IS NULL", []);

    res.json(
      donations.map((donation) => ({
        id: donation.id,
        category: donation.category,
        items: donation.items.map((item) => item.data),
        donor: donation.donor,
        location: donation.location,
        pickup: donation.pickup,
        photos: donation.photos,
        priority: donation.priority,
        aiMatch: donation.aiMatch,
        date: donation.date,
        status: donation.status,
      }))
    );
  } catch (error) {
    console.error("Available donations error:", error);
    res.status(500).json({ message: "Error fetching donations" });
  }
};

exports.acceptDonation = async (req, res) => {
  const donationId = req.params.id;
  const ngoId = req.user.id;

  try {
    const result = await db.queryAsync(
      `
        UPDATE donations
        SET status = 'assigned', ngo_id = ?, assigned_at = NOW()
        WHERE id = ? AND status = 'pending' AND (ngo_id IS NULL OR ngo_id = ?)
      `,
      [ngoId, donationId, ngoId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Donation is no longer available" });
    }

    res.json({ message: "Pickup accepted successfully" });

    runInBackground("Donation accepted notification", async () => {
      const donation = await fetchDonationById(donationId);
      if (donation) {
        await notifyDonor(donation, donation.donor, "accepted");
      }
    });
  } catch (error) {
    console.error("Accept donation error:", error);
    res.status(500).json({ message: "Failed to accept donation" });
  }
};

exports.getMyPickups = async (req, res) => {
  try {
    const donations = await fetchDonations(
      "WHERE d.ngo_id = ? AND d.status IN ('assigned', 'picked-up')",
      [req.user.id]
    );

    res.json(
      donations.map((donation) => ({
        id: donation.id,
        category: donation.category,
        items: donation.items.map((item) => item.data),
        photos: donation.photos,
        donor: donation.donor,
        pickupAddress: [
          donation.pickup.address,
          donation.pickup.landmark,
          donation.pickup.city,
          donation.pickup.state,
          donation.pickup.pincode,
        ]
          .filter(Boolean)
          .join(", "),
        pickupDate: donation.pickup.preferredDate,
        pickupTime: donation.pickup.preferredTime,
        assignedDate: donation.assignedAt || donation.date,
        status: donation.status,
        statusLabel: donation.status === "picked-up" ? "Picked Up" : "Assigned",
        pickupLocation: {
          latitude: donation.pickup.latitude,
          longitude: donation.pickup.longitude,
          address: donation.pickup.address,
          city: donation.pickup.city,
          state: donation.pickup.state,
          pincode: donation.pickup.pincode,
        },
      }))
    );
  } catch (error) {
    console.error("My pickups error:", error);
    res.status(500).json({ message: "Error fetching pickups" });
  }
};

exports.markPickupCollected = async (req, res) => {
  const donationId = req.params.id;

  try {
    const result = await db.queryAsync(
      `
        UPDATE donations
        SET status = 'picked-up'
        WHERE id = ? AND ngo_id = ? AND status = 'assigned'
      `,
      [donationId, req.user.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Pickup must be assigned before it can be marked as picked up" });
    }

    res.json({ message: "Pickup marked as collected" });

    runInBackground("Donation picked up notification", async () => {
      const donation = await fetchDonationById(donationId);
      if (donation) {
        await notifyDonor(donation, donation.donor, "pickedUp");
      }
    });
  } catch (error) {
    console.error("Pickup collection error:", error);
    res.status(500).json({ message: "Failed to update pickup status" });
  }
};

exports.completePickup = async (req, res) => {
  const donationId = req.params.id;

  try {
    const result = await db.queryAsync(
      `
        UPDATE donations
        SET status = 'completed', completed_at = NOW()
        WHERE id = ? AND ngo_id = ? AND status = 'picked-up'
      `,
      [donationId, req.user.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Pickup must be marked as picked up before completion" });
    }

    res.json({ message: "Pickup marked as completed" });

    runInBackground("Donation completed notification", async () => {
      const donation = await fetchDonationById(donationId);
      if (donation) {
        await notifyDonor(donation, donation.donor, "completed");
      }
    });
  } catch (error) {
    console.error("Complete pickup error:", error);
    res.status(500).json({ message: "Failed to complete pickup" });
  }
};

exports.getCompletedPickups = async (req, res) => {
  try {
    const donations = await fetchDonations("WHERE d.ngo_id = ? AND d.status = 'completed'", [req.user.id]);

    res.json(
      donations.map((donation) => ({
        id: donation.id,
        category: donation.category,
        items: donation.items.map((item) => item.data),
        photos: donation.photos,
        completionDate: donation.completedAt || donation.date,
        donor: donation.donor.name,
        location: `${donation.location.city}, ${donation.location.state}`,
        rating: donation.donorRating,
      }))
    );
  } catch (error) {
    console.error("Completed pickups error:", error);
    res.status(500).json({ message: "Error fetching completed pickups" });
  }
};

exports.rateDonor = async (req, res) => {
  const donationId = req.params.id;
  const rating = Number(req.body.rating);

  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return res.status(400).json({ message: "Rating must be an integer from 1 to 5" });
  }

  try {
    const result = await db.queryAsync(
      `
        UPDATE donations
        SET donor_rating = ?, donor_rating_at = NOW()
        WHERE id = ? AND ngo_id = ? AND status = 'completed'
      `,
      [rating, donationId, req.user.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Completed donation not found for this NGO" });
    }

    res.json({
      message: "Donor rated successfully",
      rating,
    });
  } catch (error) {
    console.error("Rate donor error:", error);
    res.status(500).json({ message: "Failed to save donor rating" });
  }
};

exports.withdrawDonation = async (req, res) => {
  try {
    const result = await db.queryAsync(
      `
        UPDATE donations
        SET status = 'withdrawn'
        WHERE id = ? AND donor_id = ? AND status = 'pending'
      `,
      [req.params.id, req.user.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Donation cannot be withdrawn" });
    }

    res.json({ message: "Donation withdrawn successfully" });
  } catch (error) {
    console.error("Withdraw donation error:", error);
    res.status(500).json({ message: "Withdraw failed" });
  }
};

exports.getDonationHistory = async (req, res) => {
  try {
    const donations = await fetchDonations(
      "WHERE d.donor_id = ? AND d.status IN ('withdrawn', 'completed')",
      [req.user.id]
    );

    res.json(
      donations.map((donation) => ({
        id: donation.id,
        status: donation.status,
        date: donation.completedAt || donation.date,
        photos: donation.photos,
        pickup: donation.pickup,
        ngo: donation.ngo,
        donorRating: donation.donorRating,
        donorRatingAt: donation.donorRatingAt,
        items: donation.items.map((item) => ({
          category: item.data.name,
          data: {
            quantity: item.data.quantity,
            unit: item.data.unit,
          },
        })),
      }))
    );
  } catch (error) {
    console.error("Donation history error:", error);
    res.status(500).json({ message: "Error fetching donation history" });
  }
};
