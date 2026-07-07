const recoveryEmailTemplate = ({
  merchantName,
  logoUrl,
  message,
  retryLink,
}) => {
  return `
  <div style="
    background:#F5F7FB;
    padding:60px 20px;
    font-family:Arial,sans-serif;
  ">
    <div style="
      max-width:640px;
      margin:auto;
      background:white;
      border-radius:28px;
      padding:50px;
      box-shadow:0 10px 40px rgba(0,0,0,0.05);
      border:1px solid #E5E7EB;
    ">

      <div style="text-align:center;">
        <img
          src="${logoUrl}"
          alt="${merchantName}"
          style="
            width:90px;
            margin-bottom:20px;
          "
        />

        <h1 style="
          color:#2563EB;
          font-size:48px;
          margin-bottom:12px;
          margin-top:0;
        ">
          ${merchantName}
        </h1>

        <p style="
          color:#6B7280;
          font-size:16px;
          margin-bottom:40px;
        ">
          AI-Powered Payment Recovery
        </p>
      </div>

      <div style="
        color:#374151;
        font-size:17px;
        line-height:1.9;
      ">
        ${message
          .split("\n")
          .filter(Boolean)
          .map(
            (paragraph) => `
              <p style="
                margin-bottom:24px;
                color:#374151;
                font-size:17px;
                line-height:1.9;
              ">
                ${paragraph}
              </p>
            `
          )
          .join("")}
      </div>

      <div style="
        text-align:center;
        margin-top:50px;
      ">
        <a
          href="${retryLink}"
          style="
            background:#2563EB;
            color:white;
            padding:18px 34px;
            border-radius:16px;
            text-decoration:none;
            font-weight:700;
            font-size:16px;
            display:inline-block;
            box-shadow:0 8px 20px rgba(37,99,235,0.25);
          "
        >
          Retry Payment
        </a>
      </div>

      <div style="
        margin-top:50px;
        padding-top:30px;
        border-top:1px solid #E5E7EB;
        text-align:center;
      ">
        <p style="
          color:#9CA3AF;
          font-size:14px;
          margin-bottom:10px;
        ">
          Powered by Shapay AI Recovery
        </p>

        <p style="
          color:#D1D5DB;
          font-size:12px;
        ">
          Intelligent subscription recovery infrastructure for modern African businesses.
        </p>
      </div>

    </div>
  </div>
  `;
};

module.exports =
  recoveryEmailTemplate;