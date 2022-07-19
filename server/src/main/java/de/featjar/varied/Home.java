package de.featjar.varied;

import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.Objects;

@WebServlet("/")
public class Home extends HttpServlet {
    public void doGet(HttpServletRequest request, HttpServletResponse response)
            throws IOException {
        if (Objects.equals(request.getQueryString(), "stop"))
            System.exit(0);
        response.setContentType("text/html");
        response.getWriter().println("Server is running, connect to web socket at /socket/<userID>.<br>");
        response.getWriter().println("<a href=\"?stop\">Stop server</a>");
    }
}