import org.openqa.selenium.*;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.support.ui.*;
import org.testng.Assert;
import org.testng.annotations.*;
import java.time.Duration;

public class TC-Func-SP-1-4_Test {
    private WebDriver driver;
    private WebDriverWait wait;

    @BeforeMethod
    public void setUp() {
        System.setProperty("webdriver.chrome.driver", "path/to/chromedriver");
        driver = new ChromeDriver();
        driver.manage().window().maximize();
        wait = new WebDriverWait(driver, Duration.ofSeconds(10));
        driver.get("https://example.com"); // Application home page URL
    }

    @Test
    public void test_TC-Func-SP-1-4() {
        // Navigate to signup page
        By signupLink = By.cssSelector("[data-testid='signup-link']");
        wait.until(ExpectedConditions.elementToBeClickable(signupLink)).click();

        // Enter a unique email
        String uniqueEmail = "user" + System.currentTimeMillis() + "@example.com";
        By emailField = By.cssSelector("[data-testid='email-input']");
        wait.until(ExpectedConditions.visibilityOfElementLocated(emailField)).sendKeys(uniqueEmail);

        // Enter a short password (less than 8 characters)
        By passwordField = By.cssSelector("[data-testid='password-input']");
        wait.until(ExpectedConditions.visibilityOfElementLocated(passwordField)).sendKeys("Abc12");

        // Submit the signup form
        By submitButton = By.cssSelector("[data-testid='signup-submit']");
        wait.until(ExpectedConditions.elementToBeClickable(submitButton)).click();

        // Verify validation error for password complexity
        By passwordError = By.cssSelector("[data-testid='password-error']");
        WebElement errorElement = wait.until(ExpectedConditions.visibilityOfElementLocated(passwordError));
        String errorText = errorElement.getText();
        Assert.assertTrue(errorText.toLowerCase().contains("password") && errorText.toLowerCase().contains("complexity"),
                "Expected password complexity validation error, but got: " + errorText);
    }

    @AfterMethod
    public void tearDown() {
        if (driver != null) {
            driver.quit();
        }
    }
}